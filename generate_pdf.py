#!/usr/bin/env python3
"""Generate PDF from Zhang Jie abstracts bilingual markdown"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
import re

# Register Chinese font
try:
    pdfmetrics.registerFont(TTFont('PingFang', '/System/Library/Fonts/PingFang.ttc', subfontIndex=0))
    CHINESE_FONT = 'PingFang'
except:
    try:
        pdfmetrics.registerFont(TTFont('STHeiti', '/System/Library/Fonts/STHeiti Medium.ttc'))
        CHINESE_FONT = 'STHeiti'
    except:
        CHINESE_FONT = 'Helvetica'

# Read markdown content
with open('/Users/jhinresh/clawd/zhang-jie-abstracts-2025-bilingual.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Create PDF
doc = SimpleDocTemplate(
    "/Users/jhinresh/clawd/张杰教授2025论文摘要集-双语.pdf",
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm
)

# Custom styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Title'],
    fontName=CHINESE_FONT,
    fontSize=24,
    spaceAfter=20,
    alignment=TA_CENTER
)

subtitle_style = ParagraphStyle(
    'CustomSubtitle',
    parent=styles['Normal'],
    fontName=CHINESE_FONT,
    fontSize=12,
    spaceAfter=30,
    alignment=TA_CENTER,
    textColor='gray'
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontName=CHINESE_FONT,
    fontSize=11,
    spaceBefore=15,
    spaceAfter=8,
    textColor='#1a365d'
)

subheading_style = ParagraphStyle(
    'CustomSubheading',
    parent=styles['Normal'],
    fontName=CHINESE_FONT,
    fontSize=10,
    spaceBefore=5,
    spaceAfter=5,
    textColor='#2d3748'
)

meta_style = ParagraphStyle(
    'MetaStyle',
    parent=styles['Normal'],
    fontName=CHINESE_FONT,
    fontSize=9,
    spaceBefore=3,
    spaceAfter=8,
    textColor='#718096'
)

body_style = ParagraphStyle(
    'CustomBody',
    parent=styles['Normal'],
    fontName=CHINESE_FONT,
    fontSize=10,
    spaceBefore=4,
    spaceAfter=4,
    leading=14,
    alignment=TA_JUSTIFY
)

keyword_style = ParagraphStyle(
    'KeywordStyle',
    parent=styles['Normal'],
    fontName=CHINESE_FONT,
    fontSize=9,
    spaceBefore=8,
    spaceAfter=15,
    textColor='#4a5568'
)

# Build story
story = []

# Title page
story.append(Spacer(1, 2*inch))
story.append(Paragraph("張杰教授 2025年論文摘要集", title_style))
story.append(Spacer(1, 0.3*inch))
story.append(Paragraph("北京大學口腔醫學院 口腔頜面外科", subtitle_style))
story.append(Paragraph("（14篇，中英對照版）", subtitle_style))
story.append(PageBreak())

# Parse and add each abstract
sections = re.split(r'\n## \d+\.', content)[1:]  # Split by ## N.

for i, section in enumerate(sections, 1):
    lines = section.strip().split('\n')
    
    # Extract title (English and Chinese)
    eng_title = lines[0].strip() if lines else ""
    chi_title = ""
    
    for j, line in enumerate(lines[1:], 1):
        if line.startswith('**') and line.endswith('**') and '中' in line or '腔' in line or '腫' in line:
            chi_title = line.strip('*')
            break
    
    # Add paper number and titles
    story.append(Paragraph(f"<b>{i}.</b> {eng_title}", heading_style))
    if chi_title:
        story.append(Paragraph(chi_title, subheading_style))
    
    # Find PMID line
    for line in lines:
        if 'PMID:' in line:
            story.append(Paragraph(line.strip('*'), meta_style))
            break
    
    # Extract abstract content
    in_abstract = False
    current_section = ""
    
    for line in lines:
        line = line.strip()
        
        if '### Abstract' in line or '### 摘要' in line:
            in_abstract = True
            continue
        
        if in_abstract and line.startswith('---'):
            break
            
        if in_abstract and line:
            # Clean up markdown formatting
            line = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', line)
            line = line.replace('**', '')
            
            if line.startswith('**Keywords') or line.startswith('**關鍵詞'):
                story.append(Paragraph(line, keyword_style))
            elif line and not line.startswith('#'):
                story.append(Paragraph(line, body_style))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Page break after every 2 papers (except last)
    if i < len(sections):
        story.append(PageBreak())

# Build PDF
doc.build(story)
print("PDF generated: 张杰教授2025论文摘要集-双语.pdf")
