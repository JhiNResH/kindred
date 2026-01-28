#!/usr/bin/env python3
"""Generate bilingual PDF with English and Chinese for each abstract"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

# Register Chinese font
try:
    pdfmetrics.registerFont(TTFont('PingFang', '/System/Library/Fonts/PingFang.ttc', subfontIndex=0))
    FONT = 'PingFang'
except:
    FONT = 'Helvetica'

# Styles
title_style = ParagraphStyle('Title', fontName=FONT, fontSize=22, alignment=TA_CENTER, spaceAfter=15)
subtitle_style = ParagraphStyle('Subtitle', fontName=FONT, fontSize=11, alignment=TA_CENTER, textColor='gray', spaceAfter=30)
paper_title_style = ParagraphStyle('PaperTitle', fontName=FONT, fontSize=11, spaceBefore=12, spaceAfter=3, textColor='#1a365d', leading=14)
paper_title_cn_style = ParagraphStyle('PaperTitleCN', fontName=FONT, fontSize=10, spaceAfter=5, textColor='#2d3748', leading=13)
meta_style = ParagraphStyle('Meta', fontName=FONT, fontSize=9, spaceAfter=10, textColor='#718096')
section_style = ParagraphStyle('Section', fontName=FONT, fontSize=10, spaceBefore=8, spaceAfter=3, textColor='#1a365d')
body_style = ParagraphStyle('Body', fontName=FONT, fontSize=9.5, spaceBefore=2, spaceAfter=2, leading=13, alignment=TA_JUSTIFY)
body_cn_style = ParagraphStyle('BodyCN', fontName=FONT, fontSize=9.5, spaceBefore=2, spaceAfter=6, leading=13, alignment=TA_JUSTIFY, textColor='#374151')
keyword_style = ParagraphStyle('Keyword', fontName=FONT, fontSize=9, spaceBefore=6, spaceAfter=3, textColor='#4a5568')

# Read markdown
with open('/Users/jhinresh/clawd/zhang-jie-abstracts-2025-bilingual.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Create PDF
doc = SimpleDocTemplate(
    "/Users/jhinresh/clawd/张杰教授2025论文摘要集-双语.pdf",
    pagesize=A4,
    rightMargin=1.8*cm, leftMargin=1.8*cm,
    topMargin=1.5*cm, bottomMargin=1.5*cm
)

story = []

# Title page
story.append(Spacer(1, 6*cm))
story.append(Paragraph("張杰教授 2025年論文摘要集", title_style))
story.append(Spacer(1, 0.5*cm))
story.append(Paragraph("北京大學口腔醫學院 口腔頜面外科", subtitle_style))
story.append(Paragraph("14篇・中英對照版", subtitle_style))
story.append(PageBreak())

# Papers data - manually structured for proper formatting
papers = [
    {
        "num": 1,
        "title_en": "Single-cell sequencing reveals tumor microenvironment features associated with the response to neoadjuvant immunochemotherapy in oral squamous cell carcinoma",
        "title_cn": "單細胞測序揭示口腔鱗狀細胞癌腫瘤微環境特徵與新輔助免疫化療反應的關係",
        "meta": "PMID: 40105941 | Cancer Immunol Immunother | 2025 Mar",
        "sections": [
            ("Objectives:", "In recent years, immune checkpoint inhibitors have shown promise as neoadjuvant therapies in the treatment of locally advanced oral squamous cell carcinoma (OSCC). However, the factors affecting the tumor response to immune checkpoint inhibitors (ICIs) remain unclear. This study aimed to analyze the impact of neoadjuvant chemoimmunotherapy (NACI) on the tumor microenvironment of OSCC via single-cell RNA sequencing, with the goal of optimizing treatment strategies.",
             "目的：", "近年來，免疫檢查點抑制劑作為新輔助治療在局部晚期口腔鱗狀細胞癌（OSCC）的治療中展現出良好前景。然而，影響腫瘤對免疫檢查點抑制劑（ICIs）反應的因素仍不清楚。本研究旨在通過單細胞RNA測序分析新輔助化療免疫治療（NACI）對OSCC腫瘤微環境的影響，以優化治療策略。"),
            ("Methods:", "We analyzed biopsy, primary tumor, matched metastatic lymph node, and normal lymph node samples from four patients with OSCC receiving two cycles of tislelizumab (200 mg), albumin-bound paclitaxel (260 mg/m²), and cisplatin (60-75 mg/m²), with 3-week intervals between each cycle.",
             "方法：", "我們分析了四名接受兩個週期替雷利珠單抗（200 mg）、白蛋白結合型紫杉醇（260 mg/m²）和順鉑（60-75 mg/m²）治療的OSCC患者的活檢標本、原發腫瘤、配對轉移淋巴結和正常淋巴結樣本，每個週期間隔3週。"),
            ("Results:", "We identified two major tumor cell subpopulations (C9 and C11), and patients with high expression of C11 subgroup-specific genes had a lower survival rate. FOXP3+ CD4 eTreg cells were found to potentially suppress the immune response. NACI enhances antitumor immunity by promoting the proliferation of granzyme-expressing CD8+ T effector cells while diminishing Treg-mediated immune suppression. CCL19+ fibroblastic reticular cells (FRC) were significantly associated with NACI efficacy via CXCL12-CXCR4 axis.",
             "結果：", "我們鑑定出兩個主要的腫瘤細胞亞群（C9和C11），高表達C11亞群特異性基因的患者生存率較低。發現FOXP3+ CD4 eTreg細胞可能抑制免疫反應。NACI通過促進表達顆粒酶的CD8+ T效應細胞增殖來增強抗腫瘤免疫，同時減弱Treg介導的免疫抑制。CCL19+纖維網狀細胞（FRC）通過CXCL12-CXCR4軸與NACI療效顯著相關。"),
            ("Conclusion:", "We explored the immune landscape of primary OSCC tumors and metastatic lymph nodes in relation to clinical response to NACI, offering valuable insights into treatment responses and potential new therapeutic targets.",
             "結論：", "我們探討了原發性OSCC腫瘤和轉移淋巴結的免疫圖譜與NACI臨床反應的關係，為治療反應和潛在新治療靶點提供了寶貴見解。"),
        ],
        "keywords_en": "CCL19+ fibroblastic reticular cell; Neoadjuvant chemoimmunotherapy; Oral squamous cell carcinoma; Tumor microenvironment",
        "keywords_cn": "CCL19+纖維網狀細胞；新輔助化療免疫治療；口腔鱗狀細胞癌；腫瘤微環境"
    },
    {
        "num": 2,
        "title_en": "Neoadjuvant chemoimmunotherapy brings superior quality of life of patients with locally advanced oral or oropharyngeal cancer: A propensity score-matched analysis",
        "title_cn": "新輔助化療免疫治療為局部晚期口腔或口咽癌患者帶來更優質的生活質量：傾向評分匹配分析",
        "meta": "PMID: 40015212 | Oral Oncol | 2025 Mar",
        "sections": [
            ("Background:", "The outcomes and quality of life of patients with locally advanced oral or oropharyngeal squamous cell carcinoma (LAOOPSCC) following upfront surgery (US) are suboptimal. We aimed to investigate the antitumor efficacy and quality-of-life benefits of neoadjuvant chemoimmunotherapy (NACI) compared with US.",
             "背景：", "局部晚期口腔或口咽鱗狀細胞癌（LAOOPSCC）患者接受直接手術（US）後的療效和生活質量並不理想。我們旨在研究新輔助化療免疫治療（NACI）與直接手術相比的抗腫瘤療效和生活質量獲益。"),
            ("Methods:", "570 patients were initially reviewed and 51 unbiased patients in each group were obtained through propensity score matching based on age, sex, clinical T and N stage. Quality of life was assessed with EORTC QLQ-H&N35.",
             "方法：", "初步回顧570例患者，通過基於年齡、性別、臨床T和N分期的傾向評分匹配，在每組各獲得51例無偏倚患者。採用EORTC QLQ-H&N35評估生活質量。"),
            ("Results:", "The major pathological response rate was 58.8% (30/51), objective response rate 66.7%. NACI group had shorter operative time (p=0.001), reduced hospitalization (p=0.041), less blood loss (p<0.001), and fewer free flap reconstructions (p<0.001). NACI patients had significantly better postoperative quality of life in sensory function, speech, social eating, social contact, and feeling ill (all p<0.05). No significant difference in OS or DFS.",
             "結果：", "主要病理反應率為58.8%（30/51），客觀緩解率66.7%。NACI組手術時間更短（p=0.001），住院時間更短（p=0.041），出血量更少（p<0.001），游離皮瓣重建更少（p<0.001）。NACI患者在感覺功能、言語、社交進食、社交接觸和疾病感受方面的術後生活質量明顯更好（均p<0.05）。OS和DFS無顯著差異。"),
            ("Conclusion:", "NACI is safe and feasible, and de-escalation surgery after NACI is worth promoting to improve patient postoperative quality of life.",
             "結論：", "NACI安全可行，NACI後的降階梯手術值得推廣以改善患者術後生活質量。"),
        ],
        "keywords_en": "Chemoimmunotherapy; Head and neck squamous cell carcinoma; Neoadjuvant; Propensity score analysis",
        "keywords_cn": "化療免疫治療；頭頸部鱗狀細胞癌；新輔助治療；傾向評分分析"
    },
    {
        "num": 3,
        "title_en": "Patterns of lymph node metastasis and treatment outcomes of parotid gland malignancies",
        "title_cn": "腮腺惡性腫瘤的淋巴結轉移模式及治療結果",
        "meta": "PMID: 39987446 | BMC Oral Health | 2025 Feb",
        "sections": [
            ("Background:", "This study aimed to characterize the pattern of cervical lymph node spread and evaluate prognostic factors and outcomes of surgery and postoperative adjuvant therapy in primary parotid carcinoma (PPC).",
             "背景：", "本研究旨在描述頸淋巴結擴散模式，並評估原發性腮腺癌（PPC）手術和術後輔助治療的預後因素和結果。"),
            ("Methods:", "We retrospectively enrolled 136 patients with PPC. Cox hazards models assessed survival variables; chi-square tests and logistic regression evaluated correlations between pN+ and clinicopathological factors.",
             "方法：", "我們回顧性納入136例PPC患者。Cox風險模型評估生存變量；卡方檢驗和邏輯回歸評估pN+與臨床病理因素的相關性。"),
            ("Results:", "Lymph node metastasis was detected in 60.0% of cT1-2 and 84.1% of cT3-4 tumors. Occult metastasis rate in cN0 was 55.2%. Level II metastasis most common (93.2%), followed by level I (49.3%). Five-year OS was 49.3%, DFS 34.8%. Surgery with ¹²⁵I seed brachytherapy conferred survival benefits.",
             "結果：", "cT1-2和cT3-4腫瘤的淋巴結轉移率分別為60.0%和84.1%。cN0的隱匿性轉移率為55.2%。II區轉移最常見（93.2%），其次是I區（49.3%）。5年OS為49.3%，DFS為34.8%。¹²⁵I粒子植入近距離放療聯合手術帶來生存獲益。"),
            ("Conclusion:", "High histological grade and advanced T classification were associated with occult lymph node metastasis. Neck dissection in cN0 patients significantly improved DFS and should be performed on high-grade and/or advanced T-stage tumors.",
             "結論：", "高組織學分級和晚期T分期與隱匿性淋巴結轉移相關。cN0患者的頸淋巴結清掃術顯著改善DFS，應對高分級和/或晚期T分期腫瘤患者實施。"),
        ],
        "keywords_en": "Cervical lymph node metastasis; Neck dissection; Occult metastasis; Primary parotid carcinoma; Survival",
        "keywords_cn": "頸淋巴結轉移；頸淋巴結清掃術；隱匿性轉移；原發性腮腺癌；生存"
    },
    {
        "num": 4,
        "title_en": "Integrated peripheral blood multi-omics profiling identifies immune signatures predictive of neoadjuvant PD-1 blockade efficacy in head and neck squamous cell carcinoma",
        "title_cn": "外周血多組學整合分析鑑定預測頭頸部鱗狀細胞癌新輔助PD-1阻斷療效的免疫特徵",
        "meta": "PMID: 40544277 | J Transl Med | 2025 Jun",
        "sections": [
            ("Background:", "Neoadjuvant PD-1 inhibitor therapy has shown promise in HNSCC, but only a subset achieves major pathological responses. This study aimed to develop a predictive model using liquid biopsy approaches—peripheral blood immune profiling (CyTOF) and plasma cytokine panels (Olink).",
             "背景：", "新輔助PD-1抑制劑治療在HNSCC中展現良好前景，但僅部分患者獲得主要病理反應。本研究旨在使用液體活檢方法——外周血免疫分析（CyTOF）和血漿細胞因子面板（Olink）開發預測模型。"),
            ("Methods:", "50 HNSCC patients treated with neoadjuvant tislelizumab plus chemotherapy. Immune cell subsets analyzed by CyTOF, circulating proteins quantified via 92-plex Olink panel. Features integrated using logistic regression.",
             "方法：", "50例HNSCC患者接受新輔助替雷利珠單抗聯合化療。通過CyTOF分析免疫細胞亞群，通過92重Olink面板定量循環蛋白。使用邏輯回歸整合特徵。"),
            ("Results:", "Responders showed higher CD103⁻CD8⁺ central memory T cells and elevated IL-5, IL-13; non-responders had more terminally differentiated T cells and higher CCL3, CCL4, MMP7. A multimodal model incorporating CD8⁺T cell subsets and plasma biomarkers achieved AUC=0.9219.",
             "結果：", "反應者顯示更高的CD103⁻CD8⁺中央記憶T細胞和升高的IL-5、IL-13；非反應者有更多終末分化T細胞和更高的CCL3、CCL4、MMP7。整合CD8⁺T細胞亞群和血漿生物標誌物的多模態模型達到AUC=0.9219。"),
            ("Conclusions:", "Integrated peripheral immune profiling enables robust, noninvasive prediction of neoadjuvant PD-1 blockade efficacy, supporting liquid biopsy as a viable platform for clinical decision-making.",
             "結論：", "外周免疫譜整合分析能夠穩健、無創地預測新輔助PD-1阻斷療效，支持液體活檢作為臨床決策的可行平台。"),
        ],
        "keywords_en": "Head and neck squamous cell carcinoma; Liquid biopsy; Multi-omics research; Neoadjuvant therapy; PD-1 inhibitor",
        "keywords_cn": "頭頸部鱗狀細胞癌；液體活檢；多組學研究；新輔助治療；PD-1抑制劑"
    },
    {
        "num": 5,
        "title_en": "Correlation between maxillary defect and facial asymmetry",
        "title_cn": "上頜骨缺損與面部不對稱的相關性",
        "meta": "PMID: 39870547 | Int J Oral Maxillofac Surg | 2025 Jul",
        "sections": [
            ("Purpose:", "To evaluate the correlation between maxillary defects and facial asymmetry, and establish categories for visual perception of facial asymmetry.",
             "目的：", "評估上頜骨缺損與面部不對稱的相關性，並建立面部不對稱視覺感知的分類標準。"),
            ("Methods:", "Facial data of 47 patients who underwent maxillary resection were captured using stereophotogrammetry. Asymmetry measured using landmark-independent method and Likert scale. Classified into three grades (I-III).",
             "方法：", "採用立體攝影測量法採集47例上頜骨切除術患者的面部數據。使用非標誌點依賴方法和李克特量表測量不對稱。分為三級（I-III）。"),
            ("Results:", "Significant differences (P<0.001) in asymmetry of suborbital, zygomatic, buccal, and superolabial areas among perception categories. Maxillary defect magnitude significantly influenced facial asymmetry perception (P<0.001).",
             "結果：", "不同感知類別中眶下區、顴部、頰部和上唇上區的不對稱存在顯著差異（P<0.001）。上頜骨缺損程度顯著影響面部不對稱感知（P<0.001）。"),
            ("Conclusion:", "Maxillary defects significantly affect midface soft tissue symmetry. Grade I asymmetry generally needs no correction. Grade II can be decided individually. Grade III reconstruction is essential.",
             "結論：", "上頜骨缺損顯著影響中面部軟組織對稱性。I級不對稱通常無需矯正。II級可個體化決定。III級必須進行重建。"),
        ],
        "keywords_en": "Facial asymmetry; Maxilla; Photogrammetry; Three-dimensional imaging; Visual perception",
        "keywords_cn": "面部不對稱；上頜骨；攝影測量法；三維成像；視覺感知"
    },
    {
        "num": 6,
        "title_en": "Reconstructing defects following radical parotidectomy using superficial circumflex iliac perforator flaps",
        "title_cn": "使用旋髂淺動脈穿支皮瓣修復腮腺根治術後缺損",
        "meta": "PMID: 40050935 | BMC Oral Health | 2025 Mar",
        "sections": [
            ("Background:", "Restoration of tissue defects following radical parotidectomy poses significant challenges. The SCIP flap presents advantages including adjustable volume, potential for chimerism with bone, and ability to conceal scarring.",
             "背景：", "腮腺根治術後組織缺損的修復面臨重大挑戰。SCIP皮瓣具有多項優勢，包括可調節的體積、與骨組織嵌合的潛力以及隱藏瘢痕的能力。"),
            ("Methods:", "Retrospective study of patients who underwent SCIP flap reconstruction after radical parotidectomy between June 2023-2024. Facial nerve reanimation achieved through cervical sensory nerve grafts.",
             "方法：", "對2023年6月至2024年6月使用SCIP皮瓣修復腮腺根治術後缺損患者的回顧性研究。通過頸部感覺神經移植實現面神經功能重建。"),
            ("Results:", "10 patients (4 males, 6 females), median age 45.5 years. 4 T3, 6 T4 tumors. Facial nerve reanimation in 9 patients. Flap sizes 4×8 to 6×10 cm. All flaps survived without complications.",
             "結果：", "10例患者（4男6女），中位年齡45.5歲。4例T3，6例T4腫瘤。9例進行面神經功能重建。皮瓣尺寸4×8至6×10 cm。所有皮瓣均存活無併發症。"),
            ("Conclusion:", "SCIP flaps combined with nerve grafting is a viable and safe option for reconstruction of defects from radical parotidectomy.",
             "結論：", "SCIP皮瓣聯合神經移植是修復腮腺根治術後缺損的可行且安全的選擇。"),
        ],
        "keywords_en": "Iliac artery; Microsurgical free flaps; Parotid neoplasms; Perforator flap; Rehabilitation",
        "keywords_cn": "髂動脈；顯微外科游離皮瓣；腮腺腫瘤；穿支皮瓣；康復"
    },
    {
        "num": 7,
        "title_en": "Use of Superficial Temporal Vessels in Reconstructive Oral and Maxillofacial Surgery With Vascularized Free Flaps Among \"Frozen Neck\" Patients",
        "title_cn": "顳淺血管在「冰凍頸」患者口腔頜面外科血管化游離皮瓣重建中的應用",
        "meta": "PMID: 41255777 | Laryngoscope Investig Otolaryngol | 2025 Nov",
        "sections": [
            ("Background:", "To evaluate feasibility of superficial temporal vessels as recipient vessels for vascularized free flap reconstruction in 'frozen neck' patients following radiotherapy for head and neck cancer.",
             "背景：", "評估顳淺血管作為受區血管在頭頸癌放療後「冰凍頸」患者血管化游離皮瓣重建中的可行性。"),
            ("Methods:", "16 patients underwent reconstruction using superficial temporal vessels at Peking University (2022-2024). Flaps used: ALT (n=5), RFFF (n=1), DCIA (n=8), SCIP (n=2).",
             "方法：", "2022-2024年，16例患者在北京大學接受使用顳淺血管的重建。使用皮瓣：ALT（n=5）、RFFF（n=1）、DCIA（n=8）、SCIP（n=2）。"),
            ("Results:", "All patients achieved optimal outcomes. During mean 9-month follow-up, all flaps survived with no major procedure-related morbidity.",
             "結果：", "所有患者均獲得理想結果。平均9個月隨訪期間，所有皮瓣均存活，無重大手術相關併發症。"),
            ("Conclusion:", "Superficial temporal vessels offer a safe, reliable approach for vascularized free flap reconstruction in challenging 'frozen neck' cases.",
             "結論：", "顳淺血管為具有挑戰性的「冰凍頸」病例提供了安全、可靠的血管化游離皮瓣重建方法。"),
        ],
        "keywords_en": "anastomosis; frozen neck; head and neck cancer; radiotherapy; superficial temporal vessels",
        "keywords_cn": "吻合術；冰凍頸；頭頸癌；放療；顳淺血管"
    },
    {
        "num": 8,
        "title_en": "Reconstruction of lower lip defects with chimeric nasolabial flap with buccal artery myomucosal flap",
        "title_cn": "嵌合鼻唇溝皮瓣聯合頰動脈肌黏膜瓣修復下唇缺損",
        "meta": "PMID: 39855302 | J Stomatol Oral Maxillofac Surg | 2025 Jun",
        "sections": [
            ("Purpose:", "To evaluate a chimeric flap comprising nasolabial flap and buccal artery myomucosal flap for reconstructing large lower lip defects.",
             "目的：", "評估由鼻唇溝皮瓣和頰動脈肌黏膜瓣組成的嵌合皮瓣修復下唇大面積缺損的效果。"),
            ("Methods:", "Seven patients with lower lip carcinoma underwent radical resection and reconstruction (2019-2022). Postoperative observations included flap healing, mouth opening, and lip competence.",
             "方法：", "2019-2022年，7例下唇癌患者接受根治性切除和重建。術後觀察指標包括皮瓣癒合、張口度和唇功能。"),
            ("Results:", "6 patients had flap survival without complications; 1 had marginal necrosis. Adequate lip length/height, acceptable appearance. Mouth opening 2.5-3.5 cm. All patients could eat orally in public.",
             "結果：", "6例患者皮瓣存活無併發症；1例出現邊緣壞死。唇長度/高度足夠，外觀可接受。張口度2.5-3.5 cm。所有患者均能在公共場合進食。"),
            ("Conclusions:", "This chimeric flap offers a method for reconstructing near-total and total defects of the lower lip.",
             "結論：", "該嵌合皮瓣為修復下唇近全部和全部缺損提供了一種方法。"),
        ],
        "keywords_en": "Buccal artery myomucosal flap; Chimeric flap; Lower lip defect; Nasolabial flap; Reconstruction",
        "keywords_cn": "頰動脈肌黏膜瓣；嵌合皮瓣；下唇缺損；鼻唇溝皮瓣；重建"
    },
    {
        "num": 9,
        "title_en": "Role of ¹⁸F-FDG PET/CT radiomics in predicting lymph node metastasis and prognosis in oral squamous cell carcinoma",
        "title_cn": "¹⁸F-FDG PET/CT影像組學在預測口腔鱗狀細胞癌淋巴結轉移和預後中的作用",
        "meta": "PMID: 41478255 | Radiography (Lond) | 2025 Dec",
        "sections": [
            ("Introduction:", "To develop and validate ¹⁸F-FDG PET/CT radiomics-based models for predicting cervical lymph node metastasis (LNM) and prognosis (OS and DFS) in OSCC patients.",
             "引言：", "開發和驗證基於¹⁸F-FDG PET/CT影像組學的模型，用於預測OSCC患者的頸淋巴結轉移（LNM）和預後（OS和DFS）。"),
            ("Methods:", "130 OSCC surgical patients. 107 radiomics features extracted from primary tumor. LASSO regression and random forest for feature selection. Logistic regression (LNM) and Cox regression (OS/DFS) models constructed.",
             "方法：", "130例OSCC手術患者。從原發腫瘤提取107個影像組學特徵。使用LASSO回歸和隨機森林進行特徵選擇。構建邏輯回歸（LNM）和Cox回歸（OS/DFS）模型。"),
            ("Results:", "LNM model achieved AUC=0.856, accuracy 81.5%, outperforming conventional visual PET/CT (74.6%). Combined models for OS and DFS yielded C-indexes of 0.716 and 0.683, higher than TNM staging alone.",
             "結果：", "LNM模型AUC=0.856，準確率81.5%，優於傳統視覺PET/CT（74.6%）。OS和DFS聯合模型的C-index分別為0.716和0.683，高於單獨TNM分期。"),
            ("Conclusion:", "PET/CT radiomics significantly improved LNM diagnostic accuracy and has potential as a supplementary component for TNM staging.",
             "結論：", "PET/CT影像組學顯著提高LNM診斷準確性，具有作為TNM分期補充成分的潛力。"),
        ],
        "keywords_en": "Lymph node metastasis; Oral squamous cell carcinoma; Positron emission tomography/computed tomography; Prognosis; Radiomics",
        "keywords_cn": "淋巴結轉移；口腔鱗狀細胞癌；正電子發射斷層掃描/計算機斷層掃描；預後；影像組學"
    },
    {
        "num": 10,
        "title_en": "Deep learning-based auto-segmentation model for clinical target volume delineation in brachytherapy after parotid cancer surgery",
        "title_cn": "基於深度學習的自動分割模型用於腮腺癌術後近距離放療臨床靶區勾畫",
        "meta": "PMID: 41048621 | J Contemp Brachytherapy | 2025 Aug",
        "sections": [
            ("Purpose:", "To develop and evaluate a deep learning model for auto-segmentation of CTVs in postoperative adjuvant brachytherapy for parotid gland cancer.",
             "目的：", "開發和評估用於腮腺癌術後輔助近距離放療CTV自動分割的深度學習模型。"),
            ("Methods:", "326 patients from Peking University (2017-2023). Training set 213, validation 53, test 60 cases. 3D Res-UNet model compared against manual delineations by experienced radiation oncologists.",
             "方法：", "北京大學326例患者（2017-2023）。訓練集213例，驗證集53例，測試集60例。3D Res-UNet模型與經驗豐富的放療腫瘤科醫生手動勾畫進行比較。"),
            ("Results:", "Model generated initial CTV contours in 9.4 seconds. Expert review required average 11.9 minutes vs. 46.7 minutes for fully manual delineation. DSC improved from 0.709 (auto) to 0.924 after review.",
             "結果：", "模型在9.4秒內生成初始CTV輪廓。專家審核平均需要11.9分鐘，而完全手動勾畫需要46.7分鐘。DSC從自動的0.709提高到審核後的0.924。"),
            ("Conclusions:", "Deep learning with physician review enables rapid, high-accuracy CTV generation, reducing delineation workload by >30 minutes and improving patient care.",
             "結論：", "深度學習結合醫生審核實現快速、高準確性CTV生成，將勾畫工作量減少30多分鐘，改善患者護理。"),
        ],
        "keywords_en": "auto-segmentation; brachytherapy; clinical target volume; parotid gland cancer",
        "keywords_cn": "自動分割；近距離放療；臨床靶區；腮腺癌"
    },
    {
        "num": 11,
        "title_en": "Neoadjuvant tislelizumab plus chemotherapy in locally advanced oral and oropharyngeal squamous cell carcinoma: A single-arm phase II clinical trial",
        "title_cn": "新輔助替雷利珠單抗聯合化療治療局部晚期口腔和口咽鱗狀細胞癌：單臂II期臨床試驗",
        "meta": "PMID: 41352160 | Oral Oncol | 2026 Jan",
        "sections": [
            ("Background:", "To evaluate the antitumor effect and safety of neoadjuvant chemotherapy plus tislelizumab (PD-1 inhibitor) for resectable locally advanced oral or oropharyngeal squamous cell carcinoma (LAOOPSCC).",
             "背景：", "評估新輔助化療聯合替雷利珠單抗（PD-1抑制劑）治療可切除的局部晚期口腔或口咽鱗狀細胞癌（LAOOPSCC）的抗腫瘤效果和安全性。"),
            ("Methods:", "Stage III-IV LAOOPSCC patients received two cycles of tislelizumab (200mg), albumin-bound paclitaxel (260mg/m²), and cisplatin (60-75mg/m²) at 3-week intervals, followed by surgery and adjuvant radiotherapy.",
             "方法：", "III-IV期LAOOPSCC患者接受兩個週期的替雷利珠單抗（200mg）、白蛋白結合型紫杉醇（260mg/m²）和順鉑（60-75mg/m²），每3週一次，之後手術和輔助放療。"),
            ("Results:", "82 patients completed neoadjuvant therapy. 40 underwent de-escalation surgery. ORR 67.9%, MPR 60.3%, pCR 34.2%. 2-year OS 84.4%, 2-year EFS 76.7%. Grade 3-4 adverse events in 13.4% during neoadjuvant phase.",
             "結果：", "82例患者完成新輔助治療。40例接受降階梯手術。ORR 67.9%，MPR 60.3%，pCR 34.2%。2年OS 84.4%，2年EFS 76.7%。新輔助階段3-4級不良事件發生率13.4%。"),
            ("Conclusions:", "Neoadjuvant tislelizumab plus chemotherapy achieved high pathological response rate and favorable survival with acceptable safety.",
             "結論：", "新輔助替雷利珠單抗聯合化療獲得較高病理反應率和良好生存，安全性可接受。"),
        ],
        "keywords_en": "Chemotherapy; Head and neck; Immunotherapy; Neoadjuvant; Squamous cell carcinoma",
        "keywords_cn": "化療；頭頸部；免疫治療；新輔助治療；鱗狀細胞癌"
    },
    {
        "num": 12,
        "title_en": "Is the use of intraoperative vasopressors associated with flap failure in head and neck free tissue transfer surgery?",
        "title_cn": "頭頸部游離組織移植手術中術中血管收縮劑的使用是否與皮瓣失敗相關？",
        "meta": "PMID: 40914291 | J Stomatol Oral Maxillofac Surg | 2025 Sep",
        "sections": [
            ("Background:", "The use of vasopressors to treat intraoperative hypotension during free tissue transfer is controversial. This prospective cohort study evaluates impact on flap necrosis.",
             "背景：", "游離組織移植術中使用血管收縮劑治療低血壓存在爭議。本前瞻性隊列研究評估其對皮瓣壞死的影響。"),
            ("Methods:", "239 patients (2020-2021) at Peking University, grouped by vasopressor use. Outcome: early total flap necrosis within 7 days. Univariate and multivariate logistic regression analyses performed.",
             "方法：", "北京大學239例患者（2020-2021），按血管收縮劑使用分組。結局：7天內早期皮瓣全部壞死。進行單變量和多變量邏輯回歸分析。"),
            ("Results:", "121 vasopressor group, 118 no vasopressor. Vasopressor use (OR 1.65, P=0.499) was not significantly associated with necrosis. Operation duration (OR 1.01, P=0.001) and flap ischemia duration (OR 1.02, P=0.006) were significant factors.",
             "結果：", "血管收縮劑組121例，非血管收縮劑組118例。血管收縮劑使用（OR 1.65，P=0.499）與壞死無顯著相關。手術時間（OR 1.01，P=0.001）和皮瓣缺血時間（OR 1.02，P=0.006）是顯著因素。"),
            ("Conclusions:", "Intraoperative vasopressor use during head and neck free flap surgery was not associated with early flap failure.",
             "結論：", "頭頸部游離皮瓣手術中術中血管收縮劑的使用與早期皮瓣失敗無關。"),
        ],
        "keywords_en": "Flap necrosis; Free flap transfer surgery; Intraoperative vasopressors; Methoxamine",
        "keywords_cn": "皮瓣壞死；游離皮瓣移植手術；術中血管收縮劑；甲氧明"
    },
    {
        "num": 13,
        "title_en": "Magnetic resonance neurography: Preoperative assessment of facial nerve invasion in malignant parotid gland tumors",
        "title_cn": "磁共振神經成像：惡性腮腺腫瘤面神經侵犯的術前評估",
        "meta": "PMID: 40220868 | J Stomatol Oral Maxillofac Surg | 2025 Oct",
        "sections": [
            ("Background:", "Facial nerve invasion (FNI) in parotid malignancies significantly impacts treatment and prognosis. Conventional imaging often fails to visualize the facial nerve.",
             "背景：", "腮腺惡性腫瘤中的面神經侵犯（FNI）顯著影響治療和預後。傳統影像學往往無法顯示面神經。"),
            ("Methods:", "28 patients with parotid malignancies. MRN used to visualize intraparotid facial nerve and determine tumor relationship. Results compared with surgical findings.",
             "方法：", "28例腮腺惡性腫瘤患者。使用MRN顯示腮腺內面神經並確定與腫瘤的關係。結果與手術所見比較。"),
            ("Results:", "Display rates of main trunk and divisions were 100%, 96.4%, and 96.4%. 82.1% matched surgical findings (P<0.01). T4a tumors were underestimated in 22.7% of cases. MRN-based T staging was superior (NRI>0, P=0.03).",
             "結果：", "主幹和分支的顯示率分別為100%、96.4%和96.4%。82.1%與手術所見相符（P<0.01）。22.7%的T4a腫瘤被低估。基於MRN的T分期更優（NRI>0，P=0.03）。"),
            ("Conclusions:", "MRN provides valuable information for predicting FNI, improving tumor staging and treatment decision-making.",
             "結論：", "MRN為預測FNI提供寶貴信息，改善腫瘤分期和治療決策。"),
        ],
        "keywords_en": "Facial nerve; Magnetic resonance imaging; Neoplasm invasiveness; Neurography; Parotid neoplasms",
        "keywords_cn": "面神經；磁共振成像；腫瘤侵襲性；神經成像；腮腺腫瘤"
    },
    {
        "num": 14,
        "title_en": "Progressive functional training in patients who underwent jaw defect reconstruction using vascularized iliac flaps: A randomized controlled trial",
        "title_cn": "血管化髂骨皮瓣頜骨缺損重建患者的漸進式功能訓練：隨機對照試驗",
        "meta": "PMID: 39754999 | Oral Oncol | 2025 Feb",
        "sections": [
            ("Objective:", "To investigate effects of progressive functional training on hip mobility, lower-limb stability, quality of life, and hip complications in patients with jaw reconstruction using vascularized iliac flaps.",
             "目的：", "研究漸進式功能訓練對血管化髂骨皮瓣頜骨重建患者髖關節活動度、下肢穩定性、生活質量和髖關節併發症的影響。"),
            ("Methods:", "Patients randomized to control (routine nursing) or training (progressive functional training) groups. Primary outcomes: Harris hip score and timed 'Up and Go' test. Assessed at day 7, months 1, 3, 6, 12.",
             "方法：", "患者隨機分為對照組（常規護理）或訓練組（漸進式功能訓練）。主要結局：Harris髖關節評分和計時「起立-行走」測試。在第7天、第1、3、6、12個月評估。"),
            ("Results:", "Training group showed significantly improved donor site function and quality of life at 1, 3, 6, 12 months. Load-dependent pain reduced. Gait disturbance rates at months 3, 6 significantly lower in training group (P<0.05).",
             "結果：", "訓練組在術後1、3、6、12個月的供區功能和生活質量顯著改善。負重依賴性疼痛減輕。訓練組第3、6個月的步態障礙發生率顯著更低（P<0.05）。"),
            ("Conclusion:", "Progressive functional training accelerates hip function restoration, alleviates gait disorders, relieves pain, and improves quality of life.",
             "結論：", "漸進式功能訓練加速髖關節功能恢復，緩解步態障礙，減輕疼痛，提高生活質量。"),
        ],
        "keywords_en": "Donor site function; Donor site morbidity; Functional training; Jaw reconstruction; Vascularized iliac flap",
        "keywords_cn": "供區功能；供區併發症；功能訓練；頜骨重建；血管化髂骨皮瓣"
    },
]

# Generate each paper
for paper in papers:
    # Title
    story.append(Paragraph(f"<b>{paper['num']}.</b> {paper['title_en']}", paper_title_style))
    story.append(Paragraph(paper['title_cn'], paper_title_cn_style))
    story.append(Paragraph(paper['meta'], meta_style))
    
    # Sections with English then Chinese
    for section in paper['sections']:
        en_label, en_text, cn_label, cn_text = section
        story.append(Paragraph(f"<b>{en_label}</b> {en_text}", body_style))
        story.append(Paragraph(f"<b>{cn_label}</b> {cn_text}", body_cn_style))
    
    # Keywords
    story.append(Paragraph(f"<b>Keywords:</b> {paper['keywords_en']}", keyword_style))
    story.append(Paragraph(f"<b>關鍵詞：</b> {paper['keywords_cn']}", keyword_style))
    
    story.append(Spacer(1, 0.3*cm))
    if paper['num'] < 14:
        story.append(PageBreak())

# Build
doc.build(story)
print("PDF generated successfully!")
