from pathlib import Path
from pypdf import PdfReader
import pdfplumber

root=Path(__file__).resolve().parent.parent/'output/pdf'
ids=['conversation-summary','daily-brief','product-prd','engineering-rfc','customer-interview','sales-call','legal-intake']
combined=PdfReader(root/'meetly-workflow-review.pdf')
offset=0; internal=0; external=0
for key in ids:
    path=root/f'meetly-{key}.pdf'; original=PdfReader(path)
    for i,page in enumerate(original.pages):
        assert page.extract_text().strip(), (key,i,'empty page')
        source=page.get('/Annots',[]); target=combined.pages[offset+i].get('/Annots',[])
        assert len(source)==len(target),(key,i,'lost annotations')
        for before,after in zip(source,target):
            before,after=before.get_object(),after.get_object()
            if '/Dest' in before:
                expected=original.get_page_number(before['/Dest'][0].get_object())+offset
                actual=combined.get_page_number(after['/Dest'][0].get_object())
                assert expected==actual,(key,i,'wrong transcript destination',expected,actual)
                assert before['/Dest'][1:]==after['/Dest'][1:],(key,i,'lost destination coordinate')
                internal+=1
            if '/A' in before and before['/A'].get('/S')=='/URI':
                assert before['/A']['/URI']==after['/A']['/URI']
                assert str(before['/A']['/URI']).startswith('https://')
                external+=1
    with pdfplumber.open(path) as pdf:
        for i,page in enumerate(pdf.pages):
            assert all(c['x0']>=30 and c['x1']<=page.width-30 for c in page.chars),(key,i,'horizontal clipping')
            assert all(c['top']>=10 and c['bottom']<=page.height-10 for c in page.chars),(key,i,'vertical clipping')
    if key=='daily-brief':
        assert 'Detailed edition' in original.pages[1].extract_text(),'Executive opening must fit exactly one readable page'
    offset+=len(original.pages)
assert offset==len(combined.pages)
print(f'PASS: {len(ids)} PDFs; {offset} pages; {internal} transcript links and {external} research links preserved in portfolio; no text clipping; executive opening is one page.')
