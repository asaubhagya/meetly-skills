"""Render the actual evaluation Markdown and source fixtures as readable review PDFs.

Uses ReportLab/PyPDF available in the Codex PDF runtime. Font assets are optional
local downloads; fall back to the system Arial family. No model calls or rewriting
of findings happen here. Input/output stay in ignored output/.
"""
from pathlib import Path
import json, re, html, sys
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parent.parent
MOBILE = '--mobile' in sys.argv
if MOBILE: A4 = (306, 544)  # ~108 x 192 mm; 12.5 pt reads at ~16 px on a 390 px phone.
OUT = ROOT / 'output/pdf' / ('mobile' if MOBILE else '')
OUT.mkdir(parents=True, exist_ok=True)
fixtures = json.loads((ROOT / 'benchmarks/specialists.json').read_text())
fonts = ROOT / 'output/fonts'
system = Path('/System/Library/Fonts/Supplemental')
for name, preferred, fallback in [('Body','IBMPlexSans-Regular.ttf','Arial.ttf'),
        ('Bold','IBMPlexSans-SemiBold.ttf','Arial Bold.ttf'),
        ('Italic','IBMPlexSans-Italic.ttf','Arial Italic.ttf'),
        ('Display','SpaceGrotesk-Medium.ttf','Arial.ttf')]:
    path = fonts / preferred
    pdfmetrics.registerFont(TTFont(name, str(path if path.exists() else system / fallback)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Italic',boldItalic='Bold')
INK, MUTED, PAPER = map(colors.HexColor, ['#151515','#626262','#f5f5f3'])
MARGIN = 14 if MOBILE else 40
ANCHORS = set()
styles = {
    'body': ParagraphStyle('body',fontName='Body',fontSize=10.7,leading=14.6,textColor=INK,spaceAfter=7,allowWidows=0,allowOrphans=0),
    'title': ParagraphStyle('title',fontName='Display',fontSize=27,leading=31,textColor=INK,spaceAfter=14,keepWithNext=True),
    'h2': ParagraphStyle('h2',fontName='Display',fontSize=16,leading=20,textColor=INK,spaceBefore=14,spaceAfter=8,keepWithNext=True),
    'h3': ParagraphStyle('h3',fontName='Bold',fontSize=11.5,leading=16,textColor=INK,spaceBefore=10,spaceAfter=6,keepWithNext=True),
    'meta': ParagraphStyle('meta',fontName='Body',fontSize=8.5,leading=12,textColor=MUTED,spaceAfter=8),
    'cell': ParagraphStyle('cell',fontName='Body',fontSize=9.4,leading=13,textColor=INK,spaceAfter=3),
    'quote': ParagraphStyle('quote',fontName='Italic',fontSize=10.7,leading=15.4,leftIndent=12,borderColor=colors.HexColor('#92979e'),borderWidth=0,borderPadding=5,spaceAfter=9),
}
if MOBILE:
    styles['body'].fontSize=12.5; styles['body'].leading=17
    styles['body'].spaceAfter=9
    styles['title'].fontSize=22; styles['title'].leading=26
    styles['h2'].fontSize=17; styles['h2'].leading=22
    styles['h3'].fontSize=13; styles['h3'].leading=18
    styles['meta'].fontSize=10; styles['meta'].leading=14
    styles['quote'].fontSize=12.5; styles['quote'].leading=17

def inline(text):
    text=text.replace('\u2011','-').replace('\u2013','-').replace('\u2014',' - ')
    text=html.escape(text)
    text=re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+)\)', r'<a href="\2" color="#343434"><u>\1</u></a>',text)
    text=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',text)
    text=re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)',r'<i>\1</i>',text)
    text=re.sub(r'`([^`]+)`',r'<font name="Body">\1</font>',text)
    def source_link(match):
        key=f'source-{match[1]}-{match[2].replace(":","-")}'
        return f'<a href="#{key}" color="#343434"><u>{match[0]}</u></a>' if key in ANCHORS else match[0]
    text=re.sub(r'\[(P1|E1|C1|S1|L1),\s*(\d\d:\d\d)[^\[\]<>]*\]',source_link,text)
    return text

def blocks(md, daily=False):
    lines=md.splitlines(); result=[]; i=0; seen_content=False
    while i<len(lines):
        line=lines[i].strip(); i+=1
        if not line or re.fullmatch(r'[-*_]{3,}',line): continue
        # The PDF supplies its own masthead/title and truthful export metadata.
        if not seen_content and (line.startswith('# ') or 'Synthetic evaluation sample' in line or re.match(r'^\*+Meetly',line)):
            continue
        if line.startswith('**Presentation:**'): continue
        if line.startswith('#'):
            title=re.sub(r'^#+\s*','',line)
            if daily and title.lower()=='detailed edition': result.append(PageBreak())
            result.append(Paragraph(inline(title),styles['h3' if line.startswith('###') else 'h2']))
            seen_content=True; continue
        if line.startswith('|') and i<len(lines) and re.match(r'^\|?[\s:|-]+\|?$',lines[i]):
            rows=[line]; i+=1
            while i<len(lines) and lines[i].strip().startswith('|'): rows.append(lines[i].strip()); i+=1
            if MOBILE:
                text_rows=[[c.strip() for c in row.strip('|').split('|')] for row in rows]
                for row in text_rows[1:]:
                    for header,cell in zip(text_rows[0],row):
                        result.append(Paragraph('<b>'+inline(header)+':</b> '+inline(cell),styles['body']))
                    result.append(Spacer(1,7))
                seen_content=True; continue
            cells=[[Paragraph(inline(c.strip()),styles['cell']) for c in row.strip('|').split('|')] for row in rows]
            n=len(cells[0]); cells=[r for r in cells if len(r)==n]
            table=Table(cells,colWidths=[(A4[0]-2*MARGIN)/n]*n,repeatRows=1,hAlign='LEFT')
            table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8e8e5')),
                ('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#d9d9d5')),
                ('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),
                ('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
            result.extend([table,Spacer(1,10)]); seen_content=True; continue
        if re.match(r'^[-*] ',line):
            result.append(Paragraph('• '+inline(line[2:]),styles['body'])); seen_content=True; continue
        if line.startswith('> '):
            result.append(Paragraph(inline(line[2:]),styles['quote'])); seen_content=True; continue
        para=[line]
        while i<len(lines) and lines[i].strip() and not re.match(r'^(#|\||[-*] |> )',lines[i]):
            para.append(lines[i].strip()); i+=1
        result.append(Paragraph(inline(' '.join(para)),styles['body'])); seen_content=True
    return result

class NumberedCanvas(Canvas):
    def __init__(self,*args,**kw): super().__init__(*args,**kw); self.states=[]
    def showPage(self): self.states.append(dict(self.__dict__)); self._startPage()
    def save(self):
        count=len(self.states)
        for state in self.states:
            self.__dict__.update(state)
            self.setFillColor(MUTED); self.setFont('Body',8)
            self.drawRightString(A4[0]-MARGIN,23,f'{self._pageNumber} / {count}')
            super().showPage()
        super().save()

def furniture(canvas,doc):
    canvas.saveState(); canvas.setFillColor(PAPER); canvas.rect(0,0,A4[0],A4[1],fill=1,stroke=0)
    canvas.setFillColor(INK); canvas.setFont('Bold',9); canvas.drawString(MARGIN,A4[1]-25,'Meetly')
    canvas.setFillColor(MUTED); canvas.setFont('Body',8); canvas.drawRightString(A4[0]-MARGIN,A4[1]-25,'EVIDENCE / INSIGHT / KNOWLEDGE')
    canvas.setStrokeColor(colors.HexColor('#d9d9d5')); canvas.setLineWidth(.4)
    canvas.line(MARGIN,A4[1]-33,A4[0]-MARGIN,A4[1]-33); canvas.line(MARGIN,35,A4[0]-MARGIN,35)
    canvas.setFont('Body',8); canvas.drawString(MARGIN,23,'Synthetic evaluation sample · September 2026')
    canvas.drawRightString(A4[0]-MARGIN,23,str(canvas.getPageNumber()))
    canvas.restoreState()

labels={'product-prd':'Product requirements','engineering-rfc':'Engineering RFC',
 'customer-interview':'Customer discovery','sales-call':'Sales analysis','legal-intake':'Legal client intake',
 'conversation-summary':'Conversation Summary','daily-brief':'Daily Executive Brief'}
extra=[dict(fixtures['cases'][0],id='conversation-summary',title='What matters in the handoff discussion'),
 dict(id='daily-brief',title='A day about trust',metadata='7 September 2026 · Four supplied business conversations · Asia/Singapore',
 transcript='\n\n'.join(c['metadata']+'\n'+c['transcript'] for c in fixtures['cases'][:4]),
 companyContext='\n\n'.join(c['companyContext'] for c in fixtures['cases'][:4]))]
cases=extra+fixtures['cases']
made=[]
for c in cases:
    src=ROOT/'output/evaluation/guided'/f"{c['id']}.md"
    if not src.exists(): continue
    source_lines=[]
    source_id=c['metadata'].split(';')[0] if c['id']!='daily-brief' else ''
    for line in c['transcript'].splitlines():
        if re.match(r'^[PECSL]1;',line): source_id=line.split(';')[0]
        stamp=re.match(r'^\[(\d\d:\d\d)\]',line)
        key=f'source-{source_id}-{stamp[1].replace(":","-")}' if stamp else None
        source_lines.append((line,key))
    ANCHORS={key for _,key in source_lines if key}
    story=[Paragraph(labels[c['id']].upper(),styles['meta']),Paragraph(c['title'],styles['title']),
        Paragraph('Review edition · Synthetic transcript and company-record fixtures · 8 September 2026',styles['meta'])]
    story += blocks(src.read_text(),daily=c['id']=='daily-brief')
    story += [PageBreak(),Paragraph('Source transcript & context',styles['h2']),
        Paragraph('These are fictional evaluation inputs, not customer recordings. The analysis above was generated by gpt-6-astra using the supplied Meetly instructions and public-source notes. Company records are simulated. No messages were sent or preferences changed.',styles['meta']),
        Paragraph(inline(c['metadata']),styles['meta'])]
    for line,key in source_lines:
        if line.strip(): story.append(Paragraph((f'<a name="{key}"/>' if key else '')+inline(line),styles['body']))
    story.extend([Paragraph('Supplied company context',styles['h3']),Paragraph(inline(c['companyContext']),styles['body'])])
    dest=OUT/f"meetly-{c['id']}.pdf"
    doc=SimpleDocTemplate(str(dest),pagesize=A4,rightMargin=MARGIN,leftMargin=MARGIN,topMargin=46,bottomMargin=46,
        title=f"Meetly | {labels[c['id']]} | Synthetic review",author='Meetly',pageCompression=1)
    doc.build(story,onFirstPage=furniture,onLaterPages=furniture)
    count=len(PdfReader(str(dest)).pages); made.append((dest,labels[c['id']]))
    print(f'{dest.name}: {count} pages')
if len(made)==7:
    writer=PdfWriter()
    for dest,label in made: writer.append(str(dest),outline_item=label)
    writer.add_metadata({'/Title':'Meetly | Seven workflow review samples','/Author':'Meetly'})
    with (OUT/'meetly-workflow-review.pdf').open('wb') as stream: writer.write(stream)
    print('meetly-workflow-review.pdf: all seven samples, bookmarked')
