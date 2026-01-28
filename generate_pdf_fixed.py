#!/usr/bin/env python3
"""Generate PDF with proper Chinese font support"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

# Register CID font for Chinese - this is built into reportlab
pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))
FONT = 'STSong-Light'

# Styles
title_style = ParagraphStyle('Title', fontName=FONT, fontSize=20, alignment=TA_CENTER, spaceAfter=15)
subtitle_style = ParagraphStyle('Subtitle', fontName=FONT, fontSize=11, alignment=TA_CENTER, textColor='gray', spaceAfter=30)
paper_title_style = ParagraphStyle('PaperTitle', fontName=FONT, fontSize=10, spaceBefore=10, spaceAfter=3, leading=14)
paper_title_cn_style = ParagraphStyle('PaperTitleCN', fontName=FONT, fontSize=10, spaceAfter=5, textColor='#444444', leading=14)
meta_style = ParagraphStyle('Meta', fontName=FONT, fontSize=9, spaceAfter=10, textColor='#666666')
section_label = ParagraphStyle('SectionLabel', fontName=FONT, fontSize=10, spaceBefore=8, spaceAfter=4, textColor='#333333')
body_style = ParagraphStyle('Body', fontName=FONT, fontSize=9, spaceBefore=2, spaceAfter=8, leading=14, alignment=TA_JUSTIFY)
keyword_style = ParagraphStyle('Keyword', fontName=FONT, fontSize=8, spaceBefore=6, spaceAfter=3, textColor='#555555')

# Create PDF
doc = SimpleDocTemplate(
    "/Users/jhinresh/clawd/张杰教授2025论文摘要集-双语.pdf",
    pagesize=A4,
    rightMargin=1.8*cm, leftMargin=1.8*cm,
    topMargin=1.5*cm, bottomMargin=1.5*cm
)

story = []

# Title page
story.append(Spacer(1, 5*cm))
story.append(Paragraph("张杰教授 2025年论文摘要集", title_style))
story.append(Spacer(1, 0.5*cm))
story.append(Paragraph("北京大学口腔医学院 口腔颌面外科", subtitle_style))
story.append(Paragraph("14篇 中英对照版", subtitle_style))
story.append(PageBreak())

# Papers data
papers = [
    {
        "num": 1,
        "title_en": "Single-cell sequencing reveals tumor microenvironment features associated with the response to neoadjuvant immunochemotherapy in oral squamous cell carcinoma",
        "title_cn": "单细胞测序揭示口腔鳞状细胞癌肿瘤微环境特征与新辅助免疫化疗反应的关系",
        "meta": "PMID: 40105941 | Cancer Immunol Immunother | 2025 Mar",
        "abstract_en": "In recent years, immune checkpoint inhibitors have shown promise as neoadjuvant therapies in the treatment of locally advanced oral squamous cell carcinoma (OSCC). However, the factors affecting the tumor response to immune checkpoint inhibitors (ICIs) remain unclear. This study aimed to analyze the impact of neoadjuvant chemoimmunotherapy (NACI) on the tumor microenvironment of OSCC via single-cell RNA sequencing, with the goal of optimizing treatment strategies. We analyzed biopsy, primary tumor, matched metastatic lymph node, and normal lymph node samples from four patients with OSCC receiving two cycles of tislelizumab (200 mg), albumin-bound paclitaxel (260 mg/m2), and cisplatin (60-75 mg/m2), with 3-week intervals between each cycle. We identified two major tumor cell subpopulations (C9 and C11), and patients with high expression of C11 subgroup-specific genes had a lower survival rate. FOXP3+ CD4 eTreg cells were found to potentially suppress the immune response. We found that NACI enhances antitumor immunity by promoting the proliferation of granzyme-expressing CD8+ T effector cells while simultaneously diminishing the effect of CD4+ T cells on Treg-mediated immune suppression. Furthermore, NACI was effective in suppressing inflammatory processes mediated by myeloid cells in tumors. The CCL19+ fibroblastic reticular cell (FRC) subgroup was significantly associated with the efficacy of NACI in patients with OSCC. We found that CCL19+ FRCs primarily exert their antitumor effects through interactions with CD8+ T lymphocytes via the CXCL12-CXCR4 axis. We explored the immune landscape of primary OSCC tumors and metastatic lymph nodes in relation to clinical response to NACI. Our findings offer valuable insights into patient treatment responses and highlight potential new therapeutic targets for the future management of OSCC.",
        "abstract_cn": "近年来，免疫检查点抑制剂作为新辅助治疗在局部晚期口腔鳞状细胞癌（OSCC）的治疗中展现出良好前景。然而，影响肿瘤对免疫检查点抑制剂（ICIs）反应的因素仍不清楚。本研究旨在通过单细胞RNA测序分析新辅助化疗免疫治疗（NACI）对OSCC肿瘤微环境的影响，以优化治疗策略。我们分析了四名接受两个周期替雷利珠单抗（200 mg）、白蛋白结合型紫杉醇（260 mg/m2）和顺铂（60-75 mg/m2）治疗的OSCC患者的活检标本、原发肿瘤、配对转移淋巴结和正常淋巴结样本，每个周期间隔3周。我们鉴定出两个主要的肿瘤细胞亚群（C9和C11），高表达C11亚群特异性基因的患者生存率较低。发现FOXP3+ CD4 eTreg细胞可能抑制免疫反应。我们发现NACI通过促进表达颗粒酶的CD8+ T效应细胞增殖来增强抗肿瘤免疫，同时减弱CD4+ T细胞对Treg介导的免疫抑制作用。此外，NACI有效抑制肿瘤中髓系细胞介导的炎症过程。CCL19+纤维网状细胞（FRC）亚群与OSCC患者NACI疗效显著相关。我们发现CCL19+ FRC主要通过CXCL12-CXCR4轴与CD8+ T淋巴细胞相互作用发挥抗肿瘤作用。我们探讨了原发性OSCC肿瘤和转移淋巴结的免疫图谱与NACI临床反应的关系。我们的发现为患者治疗反应提供了宝贵的见解，并为OSCC的未来治疗指出了潜在的新治疗靶点。",
        "keywords_en": "CCL19+ fibroblastic reticular cell; Neoadjuvant chemoimmunotherapy; Oral squamous cell carcinoma; Tumor microenvironment",
        "keywords_cn": "CCL19+纤维网状细胞；新辅助化疗免疫治疗；口腔鳞状细胞癌；肿瘤微环境"
    },
    {
        "num": 2,
        "title_en": "Neoadjuvant chemoimmunotherapy brings superior quality of life of patients with locally advanced oral or oropharyngeal cancer: A propensity score-matched analysis",
        "title_cn": "新辅助化疗免疫治疗为局部晚期口腔或口咽癌患者带来更优质的生活质量：倾向评分匹配分析",
        "meta": "PMID: 40015212 | Oral Oncol | 2025 Mar",
        "abstract_en": "The outcomes and quality of life of patients with locally advanced oral or oropharyngeal squamous cell carcinoma (LAOOPSCC) following upfront surgery (US) are suboptimal. The optimal neoadjuvant therapy involving programmed death-1 inhibitors still remains unknown. We aimed to investigate the antitumor efficacy and quality-of-life benefits of neoadjuvant chemoimmunotherapy (NACI) and compare them with those of US for LAOOPSCC. A total of 570 patients with OOPSCC who underwent surgical treatment between January 2021 and January 2023 were initially reviewed and we obtained 51 unbiased patients in each of the NACI and US groups through propensity score matching based on age, sex, clinical T and N stage. In the NACI group, the major pathological response rate was 58.8% (30/51), and the objective response rate was 66.7% (34/51). In the NACI group, patients experienced a shorter operative time (p = 0.001) and a reduced length of hospitalization post-surgery (p = 0.041), along with less intraoperative blood loss (p < 0.001) and fewer free flap reconstructions (p < 0.001). Compared with the patients in the US group, those in the NACI group had significantly better postoperative quality of life, including the sensory function, speech problems, social eating, social contact and feeling ill. There was no significant statistical difference in OS and DFS between the two groups. The findings demonstrate the safety and feasibility of NACI and the de-escalation surgery after NACI is worth promoting to improve patient postoperative quality of life.",
        "abstract_cn": "局部晚期口腔或口咽鳞状细胞癌（LAOOPSCC）患者接受直接手术（US）后的疗效和生活质量并不理想。涉及程序性死亡受体-1抑制剂的最佳新辅助治疗方案仍不明确。我们旨在研究新辅助化疗免疫治疗（NACI）的抗肿瘤疗效和生活质量获益，并与LAOOPSCC直接手术进行比较。我们初步回顾了2021年1月至2023年1月期间接受手术治疗的570例OOPSCC患者，并通过基于年龄、性别、临床T和N分期的倾向评分匹配，在NACI组和US组各获得51例无偏倚患者。NACI组的主要病理反应率为58.8%（30/51），客观缓解率为66.7%（34/51）。NACI组患者手术时间更短（p = 0.001），术后住院时间更短（p = 0.041），术中出血量更少（p < 0.001），游离皮瓣重建更少（p < 0.001）。与US组患者相比，NACI组患者术后生活质量明显更好，包括感觉功能、言语问题、社交进食、社交接触和疾病感受。两组的OS和DFS无显著统计学差异。研究结果表明NACI安全可行，NACI后的降阶梯手术值得推广以改善患者术后生活质量。",
        "keywords_en": "Chemoimmunotherapy; Head and neck squamous cell carcinoma; Neoadjuvant; Propensity score analysis",
        "keywords_cn": "化疗免疫治疗；头颈部鳞状细胞癌；新辅助治疗；倾向评分分析"
    },
    {
        "num": 3,
        "title_en": "Patterns of lymph node metastasis and treatment outcomes of parotid gland malignancies",
        "title_cn": "腮腺恶性肿瘤的淋巴结转移模式及治疗结果",
        "meta": "PMID: 39987446 | BMC Oral Health | 2025 Feb",
        "abstract_en": "This study aimed to characterize the pattern of cervical lymph node spread and evaluate prognostic factors and outcomes of surgery and postoperative adjuvant therapy in primary parotid carcinoma (PPC). We retrospectively enrolled 136 patients with PPC. Pathology-confirmed lymph node metastasis was detected in 60.0% and 84.1% of the patients with cT1-2 and cT3-4 tumors, respectively. The occult metastasis rate in cN0 was 55.2%. Level II metastasis was most common (93.2%), followed by level I (49.3%). Histological type, histologic grade, pT stage, and AJCC stage were significant risk factors for lymph node metastasis. One- and five-year OS were 86.0% and 49.3%, respectively (median, 60 months) and 71.6% and 34.8%, respectively, for DFS (median, 24 months). Surgery with 125I seed implant brachytherapy conferred survival benefits to patients. Histological high grade and advanced T classification were associated with occult lymph node metastasis. Postoperative radiotherapy/radiochemotherapy conferred significant survival benefits in PPC. Neck dissection in patients with cN0 cancer significantly improved DFS and should be performed on those with high-grade and/or advanced T-stage tumors.",
        "abstract_cn": "本研究旨在描述颈淋巴结扩散模式，并评估原发性腮腺癌（PPC）手术和术后辅助治疗的预后因素和结果。我们回顾性纳入136例PPC患者。病理证实的淋巴结转移在cT1-2和cT3-4肿瘤患者中分别为60.0%和84.1%。cN0的隐匿性转移率为55.2%。II区转移最常见（93.2%），其次是I区（49.3%）。组织学类型、组织学分级、pT分期和AJCC分期是淋巴结转移的重要危险因素。1年和5年OS分别为86.0%和49.3%（中位数60个月），DFS分别为71.6%和34.8%（中位数24个月）。125I粒子植入近距离放疗联合手术为患者带来生存获益。高组织学分级和晚期T分期与隐匿性淋巴结转移相关。术后放疗/放化疗为PPC患者带来显著的生存获益。cN0癌症患者的颈淋巴结清扫术显著改善DFS，应对高分级和/或晚期T分期肿瘤患者实施。",
        "keywords_en": "Cervical lymph node metastasis; Neck dissection; Occult metastasis; Primary parotid carcinoma; Survival",
        "keywords_cn": "颈淋巴结转移；颈淋巴结清扫术；隐匿性转移；原发性腮腺癌；生存"
    },
    {
        "num": 4,
        "title_en": "Integrated peripheral blood multi-omics profiling identifies immune signatures predictive of neoadjuvant PD-1 blockade efficacy in head and neck squamous cell carcinoma",
        "title_cn": "外周血多组学整合分析鉴定预测头颈部鳞状细胞癌新辅助PD-1阻断疗效的免疫特征",
        "meta": "PMID: 40544277 | J Transl Med | 2025 Jun",
        "abstract_en": "Neoadjuvant PD-1 inhibitor therapy has shown promise in locally advanced head and neck squamous cell carcinoma (HNSCC), but only a subset of patients achieves major pathological responses. This study aimed to develop a predictive model for neoadjuvant PD-1 therapy response in HNSCC patients using liquid biopsy approaches - peripheral blood immune profiling (CyTOF) and plasma cytokine panels (Olink). In a prospective trial involving 50 HNSCC patients treated with neoadjuvant tislelizumab plus chemotherapy, peripheral blood samples were collected pre- and post-treatment. Baseline immune profiles differed significantly between responder (RD) and non-responder (NRD): RD showed higher frequencies of CD103-CD8+ central memory T cells and elevated plasma interleukins (IL-5, IL-13), whereas NRD had more terminally differentiated T cells and higher levels of chemokines (CCL3, CCL4) and MMP7. A multimodal predictive model incorporating CD8+ T cell subsets and plasma biomarkers demonstrated superior predictive accuracy (AUC = 0.9219). Integrated peripheral immune profiling enables robust, noninvasive prediction of neoadjuvant PD-1 blockade efficacy in HNSCC.",
        "abstract_cn": "新辅助PD-1抑制剂治疗在局部晚期头颈部鳞状细胞癌（HNSCC）中展现出良好前景，但仅部分患者能获得主要病理反应。本研究旨在使用液体活检方法——外周血免疫分析（CyTOF）和血浆细胞因子面板（Olink）——为HNSCC患者开发新辅助PD-1治疗反应的预测模型。在一项纳入50例接受新辅助替雷利珠单抗联合化疗的HNSCC患者的前瞻性试验中，收集治疗前后的外周血样本。反应者（RD）和非反应者（NRD）的基线免疫谱存在显著差异：RD显示更高频率的CD103-CD8+中央记忆T细胞和升高的血浆白介素（IL-5、IL-13），而NRD有更多终末分化T细胞和更高水平的趋化因子（CCL3、CCL4）及MMP7。整合CD8+ T细胞亚群和血浆生物标志物的多模态预测模型显示出优越的预测准确性（AUC = 0.9219）。外周免疫谱整合分析能够稳健、无创地预测HNSCC新辅助PD-1阻断疗效。",
        "keywords_en": "Head and neck squamous cell carcinoma; Liquid biopsy; Multi-omics research; Neoadjuvant therapy; PD-1 inhibitor",
        "keywords_cn": "头颈部鳞状细胞癌；液体活检；多组学研究；新辅助治疗；PD-1抑制剂"
    },
    {
        "num": 5,
        "title_en": "Correlation between maxillary defect and facial asymmetry",
        "title_cn": "上颌骨缺损与面部不对称的相关性",
        "meta": "PMID: 39870547 | Int J Oral Maxillofac Surg | 2025 Jul",
        "abstract_en": "The aim of this study was to evaluate the correlation between maxillary defects and facial asymmetry, and to establish categories for visual perception of facial asymmetry. The facial data of 47 patients who underwent maxillary resection due to tumors were captured using stereophotogrammetry. Facial asymmetry was measured using a landmark-independent method and assessed with a Likert scale. Facial asymmetry was classified into three grades (I-III) based on visual perception. Statistically significant differences (P < 0.001) were found in the asymmetry of the suborbital, zygomatic, buccal, and superolabial areas among the different visual perception categories. The maxillary defect magnitude significantly influenced facial asymmetry perception (P < 0.001). Maxillary defects significantly affect the midface soft tissue symmetry. Reconstruction should focus on sufficient soft tissue support in the zygomatic, buccal, suborbital, and superolabial areas. Corrective measures are generally unnecessary for grade I asymmetry. For grade II asymmetry, reconstruction can be decided individually. For grade III asymmetry, reconstruction is essential.",
        "abstract_cn": "本研究旨在评估上颌骨缺损与面部不对称的相关性，并建立面部不对称视觉感知的分类标准。采用立体摄影测量法采集47例因肿瘤行上颌骨切除术患者的面部数据。使用非标志点依赖方法测量面部不对称，并采用李克特量表进行评估。根据视觉感知将面部不对称分为三级（I-III）。在不同视觉感知类别中，眶下区、颧部、颊部和上唇上区的不对称存在统计学显著差异（P < 0.001）。上颌骨缺损程度显著影响面部不对称感知（P < 0.001）。上颌骨缺损显著影响中面部软组织对称性。重建应注重颧部、颊部、眶下区和上唇上区的充分软组织支撑。I级不对称通常无需矫正措施。II级不对称可个体化决定是否重建。III级不对称则必须进行重建。",
        "keywords_en": "Facial asymmetry; Maxilla; Photogrammetry; Three-dimensional imaging; Visual perception",
        "keywords_cn": "面部不对称；上颌骨；摄影测量法；三维成像；视觉感知"
    },
    {
        "num": 6,
        "title_en": "Reconstructing defects following radical parotidectomy using superficial circumflex iliac perforator flaps",
        "title_cn": "使用旋髂浅动脉穿支皮瓣修复腮腺根治术后缺损",
        "meta": "PMID: 40050935 | BMC Oral Health | 2025 Mar",
        "abstract_en": "The restoration of tissue defects following radical parotidectomy poses significant challenges due to the complex anatomy and functional requirements of the region. The superficial circumflex iliac perforator (SCIP) flap presents several advantages, including its adjustable volume, the potential for chimerism with bone, and the ability to conceal scarring. This study was conducted to assess the effectiveness and safety of SCIP flaps in reconstructing defects after radical parotidectomy. This retrospective study included patients who underwent reconstruction using SCIP flaps between June 2023 and June 2024. Facial nerve reanimation was achieved through the use of cervical sensory nerve grafts. The study included 10 patients (4 males, 6 females) with a median age of 45.5 years. Four had T3 tumors and six had T4 tumors. Facial nerve reanimation was performed in 9 patients. Flap sizes ranged from 4 cm x 8 cm to 6 cm x 10 cm, and pedicle lengths from 4 cm to 9 cm. Six patients underwent postoperative radiotherapy. All flaps survived without radiation-related recipient complications or donor site complications. The use of SCIP flaps has been demonstrated to be a viable and safe option for the reconstruction of defects resulting from radical parotidectomy when combined with nerve grafting techniques.",
        "abstract_cn": "腮腺根治术后组织缺损的修复因该区域复杂的解剖结构和功能要求而面临重大挑战。旋髂浅动脉穿支皮瓣（SCIP）具有多项优势，包括可调节的体积、与骨组织嵌合的潜力以及隐藏瘢痕的能力。本研究旨在评估SCIP皮瓣修复腮腺根治术后缺损的有效性和安全性。这项回顾性研究纳入了2023年6月至2024年6月期间使用SCIP皮瓣修复的患者。通过颈部感觉神经移植实现面神经功能重建。研究纳入10例患者（4男6女），中位年龄45.5岁。4例为T3肿瘤，6例为T4肿瘤。9例患者进行了面神经功能重建。皮瓣尺寸范围为4 cm x 8 cm至6 cm x 10 cm，蒂部长度为4 cm至9 cm。6例患者接受了术后放疗。所有皮瓣均存活，无放疗相关受区并发症或供区并发症。SCIP皮瓣联合神经移植技术已被证明是修复腮腺根治术后缺损的可行且安全的选择。",
        "keywords_en": "Iliac artery; Microsurgical free flaps; Parotid neoplasms; Perforator flap; Rehabilitation",
        "keywords_cn": "髂动脉；显微外科游离皮瓣；腮腺肿瘤；穿支皮瓣；康复"
    },
    {
        "num": 7,
        "title_en": "Use of Superficial Temporal Vessels in Reconstructive Oral and Maxillofacial Surgery With Vascularized Free Flaps Among Frozen Neck Patients",
        "title_cn": "颞浅血管在冰冻颈患者口腔颌面外科血管化游离皮瓣重建中的应用",
        "meta": "PMID: 41255777 | Laryngoscope Investig Otolaryngol | 2025 Nov",
        "abstract_en": "This study aimed to evaluate the feasibility of using superficial temporal vessels as recipient vessels for vascularized free flap reconstruction in frozen neck patients following radiotherapy for head and neck cancer (HNC). Between February 2022 and November 2024, 16 patients underwent vascularized free flap reconstruction by using superficial temporal vessels at Peking University School and Hospital of Stomatology. Among them, anterolateral thigh flap (ALT, n = 5), radial forearm free flap (RFFF, n = 1), deep circumflex iliac artery microvascular free flap (DCIA, n = 8), and superficial iliac circumflex artery perforator flap (SCIP, n = 2) were utilized. All patients attained optimal surgical outcomes. During the mean follow-up period of 9 months, all flaps survived with absence of major procedure-related morbidity. Superficial temporal vessels offer a safe, reliable approach for vascularized free flap reconstruction in challenging frozen neck cases, providing an effective alternative in oral-maxillofacial reconstruction.",
        "abstract_cn": "本研究旨在评估颞浅血管作为受区血管在头颈癌（HNC）放疗后冰冻颈患者血管化游离皮瓣重建中的可行性。2022年2月至2024年11月期间，16例患者在北京大学口腔医学院接受了使用颞浅血管的血管化游离皮瓣重建。其中使用股前外侧皮瓣（ALT，n = 5）、桡侧前臂游离皮瓣（RFFF，n = 1）、旋髂深动脉显微血管游离皮瓣（DCIA，n = 8）和旋髂浅动脉穿支皮瓣（SCIP，n = 2）。所有患者均获得理想的手术结果。在平均9个月的随访期间，所有皮瓣均存活，无重大手术相关并发症。颞浅血管为具有挑战性的冰冻颈病例提供了安全、可靠的血管化游离皮瓣重建方法，是口腔颌面部重建的有效替代方案。",
        "keywords_en": "anastomosis; frozen neck; head and neck cancer; radiotherapy; superficial temporal vessels",
        "keywords_cn": "吻合术；冰冻颈；头颈癌；放疗；颞浅血管"
    },
    {
        "num": 8,
        "title_en": "Reconstruction of lower lip defects with chimeric nasolabial flap with buccal artery myomucosal flap",
        "title_cn": "嵌合鼻唇沟皮瓣联合颊动脉肌黏膜瓣修复下唇缺损",
        "meta": "PMID: 39855302 | J Stomatol Oral Maxillofac Surg | 2025 Jun",
        "abstract_en": "This study aimed to evaluate a chimeric flap comprising a nasolabial flap and a buccal artery myomucosal flap used to reconstruct a large defect of the lower lip. From November 2019 to August 2022, seven patients with lower lip carcinoma underwent radical resection and reconstruction. A chimeric flap comprising a nasolabial flap and a buccal artery myomucosal flap was used to reconstruct the large defect of the lower lip. The flap survived without complications in 6 patients; 1 patient showed marginal necrosis of the skin paddle. The reconstructed lower lip had an adequate lip length and height, and its appearance was acceptable. The mouth opening ranged from 2.5 cm to 3.5 cm. All patients were able to intake oral diet in a public setting. The chimeric flap, comprising a nasolabial flap and a buccal artery myomucosal flap, offers a method for reconstructing near-total and total defects of the lower lip.",
        "abstract_cn": "本研究旨在评估由鼻唇沟皮瓣和颊动脉肌黏膜瓣组成的嵌合皮瓣修复下唇大面积缺损的效果。2019年11月至2022年8月，7例下唇癌患者接受了根治性切除和重建。采用由鼻唇沟皮瓣和颊动脉肌黏膜瓣组成的嵌合皮瓣修复下唇大面积缺损。6例患者皮瓣存活无并发症；1例患者出现皮岛边缘坏死。重建的下唇具有足够的唇长度和高度，外观可接受。张口度为2.5 cm至3.5 cm。所有患者均能在公共场合进行口服饮食。由鼻唇沟皮瓣和颊动脉肌黏膜瓣组成的嵌合皮瓣为修复下唇近全部和全部缺损提供了一种方法。",
        "keywords_en": "Buccal artery myomucosal flap; Chimeric flap; Lower lip defect; Nasolabial flap; Reconstruction",
        "keywords_cn": "颊动脉肌黏膜瓣；嵌合皮瓣；下唇缺损；鼻唇沟皮瓣；重建"
    },
    {
        "num": 9,
        "title_en": "Role of 18F-FDG PET/CT radiomics in predicting lymph node metastasis and prognosis in oral squamous cell carcinoma",
        "title_cn": "18F-FDG PET/CT影像组学在预测口腔鳞状细胞癌淋巴结转移和预后中的作用",
        "meta": "PMID: 41478255 | Radiography (Lond) | 2025 Dec",
        "abstract_en": "This study aimed to develop and validate 18F-FDG positron emission tomography/computed tomography (PET/CT) radiomics-based models for predicting cervical lymph node metastasis (LNM) and prognosis (overall survival [OS] and disease-free survival [DFS]) in patients with oral squamous cell carcinoma (OSCC). We retrospectively enrolled 130 patients with OSCC who underwent surgery. A total of 107 radiomics features were extracted from the primary tumor. The LNM diagnostic model achieved an area under the curve (AUC) of 0.856 and an accuracy of 81.5%, outperforming conventional visual PET/CT assessment (accuracy = 74.6%). For prognosis, the combined radiomic-clinical models for OS and DFS yielded C-indexes of 0.716 and 0.683, respectively, both significantly higher than those of TNM stage (0.630 and 0.594). Both prognostic models successfully stratified patients into high- and low-risk groups with significant survival differences (p < 0.01). PET/CT radiomics significantly improved the diagnostic accuracy for cervical LNM and possessed the potential as a supplementary component for the TNM staging system.",
        "abstract_cn": "本研究旨在开发和验证基于18F-FDG正电子发射断层扫描/计算机断层扫描（PET/CT）影像组学的模型，用于预测口腔鳞状细胞癌（OSCC）患者的颈淋巴结转移（LNM）和预后（总生存期[OS]和无病生存期[DFS]）。我们回顾性纳入130例接受手术的OSCC患者。从原发肿瘤中提取107个影像组学特征。LNM诊断模型曲线下面积（AUC）达到0.856，准确率为81.5%，优于传统视觉PET/CT评估（准确率 = 74.6%）。在预后方面，OS和DFS的联合影像组学-临床模型的C-index分别为0.716和0.683，均显著高于TNM分期（0.630和0.594）。两个预后模型均成功将患者分为高风险和低风险组，生存差异显著（p < 0.01）。PET/CT影像组学显著提高了颈部LNM的诊断准确性，具有作为TNM分期系统补充成分的潜力。",
        "keywords_en": "Lymph node metastasis; Oral squamous cell carcinoma; Positron emission tomography/computed tomography; Prognosis; Radiomics",
        "keywords_cn": "淋巴结转移；口腔鳞状细胞癌；正电子发射断层扫描/计算机断层扫描；预后；影像组学"
    },
    {
        "num": 10,
        "title_en": "Deep learning-based auto-segmentation model for clinical target volume delineation in brachytherapy after parotid cancer surgery",
        "title_cn": "基于深度学习的自动分割模型用于腮腺癌术后近距离放疗临床靶区勾画",
        "meta": "PMID: 41048621 | J Contemp Brachytherapy | 2025 Aug",
        "abstract_en": "Timely and accurate delineation of the clinical target volume (CTV) in brachytherapy after parotid cancer surgery plays a crucial role in tailored delivery of radiation doses. This study aimed to develop and evaluate a deep learning-based model for auto-segmentation of the CTVs in postoperative adjuvant brachytherapy for patients with parotid gland cancer. Using clinical imaging data from 326 patients with parotid gland carcinoma treated at Peking University School and Hospital of Stomatology between 2017 and 2023, we established a training dataset of 213 cases, a validation set of 53 cases, and a test set of 60 cases. The CTVs on the images were segmented using 3D Res-UNet, a deep learning model. The deep learning model generated initial CTV contours in 9.4 seconds of computational time. Subsequent expert review and minor adjustments required an average of 11.9 minutes, substantially shorter than the 46.7 minutes needed for fully manual delineation. Quantitative analysis showed that the Dice similarity coefficient (DSC) of automatic segmentation by 3D Res-UNet was 0.709, which improved to 0.924 after expert review. Automatic contouring with physician review enabled high-accuracy and rapid CTV generation, reducing the overall delineation workload by more than 30 minutes.",
        "abstract_cn": "腮腺癌术后近距离放疗中临床靶区（CTV）的及时准确勾画对于个体化放射剂量递送至关重要。本研究旨在开发和评估基于深度学习的模型，用于腮腺癌患者术后辅助近距离放疗CTV的自动分割。使用2017年至2023年在北京大学口腔医学院接受治疗的326例腮腺癌患者的临床影像数据，我们建立了213例的训练数据集、53例的验证集和60例的测试集。使用深度学习模型3D Res-UNet对图像上的CTV进行分割。深度学习模型在9.4秒的计算时间内生成初始CTV轮廓。随后的专家审核和微调平均需要11.9分钟，明显短于完全手动勾画所需的46.7分钟。定量分析显示，3D Res-UNet自动分割的Dice相似系数（DSC）为0.709，经专家审核后提高至0.924。自动勾画结合医生审核实现了高准确性和快速CTV生成，将整体勾画工作量减少了30多分钟。",
        "keywords_en": "auto-segmentation; brachytherapy; clinical target volume; parotid gland cancer",
        "keywords_cn": "自动分割；近距离放疗；临床靶区；腮腺癌"
    },
    {
        "num": 11,
        "title_en": "Neoadjuvant tislelizumab plus chemotherapy in locally advanced oral and oropharyngeal squamous cell carcinoma: A single-arm phase II clinical trial",
        "title_cn": "新辅助替雷利珠单抗联合化疗治疗局部晚期口腔和口咽鳞状细胞癌：单臂II期临床试验",
        "meta": "PMID: 41352160 | Oral Oncol | 2026 Jan",
        "abstract_en": "This study aimed to evaluate the antitumor effect and safety of neoadjuvant chemotherapy plus tislelizumab (a programmed death-1 inhibitor) for the treatment of resectable locally advanced oral or oropharyngeal squamous cell carcinoma (LAOOPSCC). Eligible patients with stage III-IV LAOOPSCC were treated with two cycles of tislelizumab (200 mg), albumin-bound paclitaxel (260 mg/m2), and cisplatin (60-75 mg/m2) with a three-week interval between each cycle; this treatment was followed by surgery and adjuvant radiotherapy or concurrent chemoradiotherapy. Between March 2022 and June 2023, a total of 82 patients were eligible and completed two cycles of neoadjuvant therapy. Forty patients underwent de-escalation surgery for the primary tumor. Orbital floor resection was avoided in 1 patient, mandibulectomy was avoided in 5 patients, and near-total glossectomy or total glossectomy was avoided in 32 patients. An objective response rate of 67.9% and an MPR rate of 60.3% were achieved, with 34.2% of patients achieving a pathological complete response. With a median follow-up time of 24 months, the two-year overall survival rate was 84.4%, and the two-year event-free survival rate was 76.7%. Treatment-related adverse events of grade 3 or 4 occurred in 11 patients (13.4%) during the neoadjuvant therapy. Neoadjuvant tislelizumab plus chemotherapy for LAOOPSCC achieved a high pathological response rate and favorable survival metrics with an acceptable safety profile.",
        "abstract_cn": "本研究旨在评估新辅助化疗联合替雷利珠单抗（一种程序性死亡受体-1抑制剂）治疗可切除的局部晚期口腔或口咽鳞状细胞癌（LAOOPSCC）的抗肿瘤效果和安全性。符合条件的III-IV期LAOOPSCC患者接受两个周期的替雷利珠单抗（200 mg）、白蛋白结合型紫杉醇（260 mg/m2）和顺铂（60-75 mg/m2）治疗，每个周期间隔3周；之后进行手术和辅助放疗或同步放化疗。2022年3月至2023年6月期间，共82例患者符合条件并完成了两个周期的新辅助治疗。40例患者对原发肿瘤进行了降阶梯手术。1例患者避免了眶底切除，5例患者避免了下颌骨切除，32例患者避免了近全舌切除或全舌切除。客观缓解率为67.9%，MPR率为60.3%，34.2%的患者达到病理完全缓解。中位随访时间为24个月，2年总生存率为84.4%，2年无事件生存率为76.7%。新辅助治疗期间，11例患者（13.4%）发生3级或4级治疗相关不良事件。新辅助替雷利珠单抗联合化疗治疗LAOOPSCC获得了较高的病理反应率和良好的生存指标，安全性可接受。",
        "keywords_en": "Chemotherapy; Head and neck; Immunotherapy; Neoadjuvant; Squamous cell carcinoma",
        "keywords_cn": "化疗；头颈部；免疫治疗；新辅助治疗；鳞状细胞癌"
    },
    {
        "num": 12,
        "title_en": "Is the use of intraoperative vasopressors associated with flap failure in head and neck free tissue transfer surgery?",
        "title_cn": "头颈部游离组织移植手术中术中血管收缩剂的使用是否与皮瓣失败相关？",
        "meta": "PMID: 40914291 | J Stomatol Oral Maxillofac Surg | 2025 Sep",
        "abstract_en": "Maintaining appropriate blood pressure during head and neck free tissue transfer surgery is important for both organ and flap perfusion. However, the use of vasopressors to treat intraoperative hypotension is controversial. The purpose of this prospective cohort study is to evaluate the impact of intraoperative vasopressors on the incidence of flap necrosis. This prospective cohort study examined patients undergoing free tissue transfer surgery of the head and neck between January 2020 and December 2021 at Peking University School and Hospital of Stomatology. A total of 239 participants were enrolled, with 121 in the vasopressor group and 118 in the no vasopressor group. Although vasopressor use (odds ratio [OR], 1.65; 95% confidence interval [CI], 0.39-7.07; P = 0.499) was not significantly associated with flap necrosis in univariate analysis, operation duration (OR, 1.01; P = 0.001) and flap ischemia duration (OR, 1.02; P = 0.006) were. The smooth curve fitting results demonstrated that both operation duration and flap ischemia duration had a positive linear correlation with flap necrosis. Use of intraoperative vasopressors during free flap transfer surgery of the head and neck was not associated with early flap failure.",
        "abstract_cn": "头颈部游离组织移植手术中维持适当的血压对器官和皮瓣灌注都很重要。然而，使用血管收缩剂治疗术中低血压存在争议。本前瞻性队列研究旨在评估术中血管收缩剂对皮瓣坏死发生率的影响。这项前瞻性队列研究检查了2020年1月至2021年12月期间在北京大学口腔医学院接受头颈部游离组织移植手术的患者。共纳入239例参与者，血管收缩剂组121例，非血管收缩剂组118例。尽管在单变量分析中血管收缩剂使用（比值比[OR] 1.65；95%置信区间[CI] 0.39-7.07；P = 0.499）与皮瓣坏死无显著相关，但手术时间（OR 1.01；P = 0.001）和皮瓣缺血时间（OR 1.02；P = 0.006）与之相关。平滑曲线拟合结果表明，手术时间和皮瓣缺血时间均与皮瓣坏死呈正线性相关。头颈部游离皮瓣移植手术中术中血管收缩剂的使用与早期皮瓣失败无关。",
        "keywords_en": "Flap necrosis; Free flap transfer surgery; Intraoperative vasopressors; Methoxamine",
        "keywords_cn": "皮瓣坏死；游离皮瓣移植手术；术中血管收缩剂；甲氧明"
    },
    {
        "num": 13,
        "title_en": "Magnetic resonance neurography: Preoperative assessment of facial nerve invasion in malignant parotid gland tumors",
        "title_cn": "磁共振神经成像：恶性腮腺肿瘤面神经侵犯的术前评估",
        "meta": "PMID: 40220868 | J Stomatol Oral Maxillofac Surg | 2025 Oct",
        "abstract_en": "Facial nerve invasion (FNI) in parotid gland malignancies significantly impacts treatment outcomes and prognosis. Accurate preoperative assessment of FNI is crucial for surgical planning and tumor staging. Conventional imaging modalities often fail to visualize the facial nerve and assess FNI. This study aims to evaluate the predictive efficacy of magnetic resonance neurography (MRN) in detecting FNI in parotid gland malignancies. 28 patients with parotid gland malignancies were included. MRN was utilized to visualize the intraparotid facial nerve and determine its relationship with the tumor. The display rates of the main trunk and other divisions (temporofacial and cervicofacial) of the intraparotid facial nerve were 100%, 96.4%, and 96.4%, respectively. Twenty-three patients (82.1%) matched the surgical findings (P < 0.01). MRN-indicated infiltration performed better than facial paralysis in predicting FNI. Tumors of stage T4a were underestimated in 22.7% of cases (n = 5), and evaluation of clinical T stage with MRN was superior to that without MRN (NRI > 0, Z = 2.17, P = 0.03). MRN can provide valuable information for predicting FNI in parotid gland malignancies, thereby improving tumor staging and aiding treatment decision-making.",
        "abstract_cn": "腮腺恶性肿瘤中的面神经侵犯（FNI）显著影响治疗结果和预后。FNI的准确术前评估对手术计划和肿瘤分期至关重要。传统影像学方法往往无法显示面神经和评估FNI。本研究旨在评估磁共振神经成像（MRN）检测腮腺恶性肿瘤FNI的预测效能。纳入28例腮腺恶性肿瘤患者。使用MRN显示腮腺内面神经并确定其与肿瘤的关系。腮腺内面神经主干和其他分支（颞面支和颈面支）的显示率分别为100%、96.4%和96.4%。23例患者（82.1%）与手术所见相符（P < 0.01）。MRN提示的侵犯在预测FNI方面优于面瘫。22.7%的病例（n = 5）中T4a期肿瘤被低估，使用MRN的临床T分期评估优于不使用MRN（NRI > 0，Z = 2.17，P = 0.03）。MRN可为预测腮腺恶性肿瘤FNI提供宝贵信息，从而改善肿瘤分期并辅助治疗决策。",
        "keywords_en": "Facial nerve; Magnetic resonance imaging; Neoplasm invasiveness; Neurography; Parotid neoplasms",
        "keywords_cn": "面神经；磁共振成像；肿瘤侵袭性；神经成像；腮腺肿瘤"
    },
    {
        "num": 14,
        "title_en": "Progressive functional training in patients who underwent jaw defect reconstruction using vascularized iliac flaps: A randomized controlled trial",
        "title_cn": "血管化髂骨皮瓣颌骨缺损重建患者的渐进式功能训练：随机对照试验",
        "meta": "PMID: 39754999 | Oral Oncol | 2025 Feb",
        "abstract_en": "This trial was aimed at investigating the effects of progressive functional training on hip mobility, lower-limb stability, quality of life, and hip complications in patients who have undergone jaw defect reconstruction using vascularized iliac flaps. Patients who underwent reconstruction surgery with vascularized iliac flaps were randomly divided into control and training groups. The control group, according to routine nursing practice, only received activity and safety guidance after the operation. The training group received progressive functional training for functional exercise. The primary outcomes were donor area function-Harris hip score and the timed Up and Go test. Secondary outcomes were patients quality of life, the hip visual analog scale, and other complications. The donor area function and quality of life of the patients in the training group were significantly improved at 1, 3, 6, and 12 months after surgery, and the differences were statistically significant. The load-dependent pain in the training group was significantly reduced compared with that in the control group. The incidence rates of gait disturbance at postoperative months 3, and 6 in the training group were significantly lower than the corresponding rates in the control group (P < 0.05). Progressive functional training can accelerate the restoration of hip function and stability of lower-limb movement, alleviate gait disorders, relieve pain, and improve patients quality of life.",
        "abstract_cn": "本试验旨在研究渐进式功能训练对血管化髂骨皮瓣颌骨缺损重建患者髋关节活动度、下肢稳定性、生活质量和髋关节并发症的影响。接受血管化髂骨皮瓣重建手术的患者被随机分为对照组和训练组。对照组按照常规护理实践，术后仅接受活动和安全指导。训练组接受渐进式功能训练进行功能锻炼。主要结局为供区功能-Harris髋关节评分和计时起立-行走测试。次要结局为患者生活质量、髋关节视觉模拟量表和其他并发症。训练组患者的供区功能和生活质量在术后1、3、6、12个月显著改善，差异具有统计学意义。与对照组相比，训练组的负重依赖性疼痛显著减轻。训练组术后第3、6个月的步态障碍发生率显著低于对照组（P < 0.05）。渐进式功能训练可加速髋关节功能恢复和下肢运动稳定性，缓解步态障碍，减轻疼痛，提高患者生活质量。",
        "keywords_en": "Donor site function; Donor site morbidity; Functional training; Jaw reconstruction; Vascularized iliac flap",
        "keywords_cn": "供区功能；供区并发症；功能训练；颌骨重建；血管化髂骨皮瓣"
    },
]

# Generate each paper
for paper in papers:
    # Number and titles
    story.append(Paragraph(f"<b>{paper['num']}. {paper['title_en']}</b>", paper_title_style))
    story.append(Paragraph(paper['title_cn'], paper_title_cn_style))
    story.append(Paragraph(paper['meta'], meta_style))
    
    # Abstract
    story.append(Paragraph("<b>Abstract</b>", section_label))
    story.append(Paragraph(paper['abstract_en'], body_style))
    
    # Chinese translation
    story.append(Paragraph("<b>摘要</b>", section_label))
    story.append(Paragraph(paper['abstract_cn'], body_style))
    
    # Keywords
    story.append(Paragraph(f"<b>Keywords:</b> {paper['keywords_en']}", keyword_style))
    story.append(Paragraph(f"<b>关键词：</b> {paper['keywords_cn']}", keyword_style))
    
    if paper['num'] < 14:
        story.append(PageBreak())

# Build
doc.build(story)
print("PDF generated successfully!")
