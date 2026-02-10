idea_v2.md的功能已经全部完成，下面是改进和修正bug

这是 Light Theme 的设计语言，主打‘Empathy & Warmth’（共情与温暖）。”

UI 设计规范：SocialAnimal - Light Theme ("Nordic Sunrise")
设计理念： 与 Dark Theme 的“硬核科技感”相反，Light Theme 追求的是 “柔和、包容、安全”。我们要模仿清晨阳光的渐变色，使用大量的 毛玻璃效果 (Glassmorphism) 和 圆角 (Rounded Corners)，减少攻击性，增加亲和力。

1. 色彩系统 (Color Palette)
参考图 中的渐变，我们需要定义以下 CSS 变量：

Background (主背景): 一个全屏的柔和线性渐变。

CSS: linear-gradient(135deg, #FDE68A 0%, #FBCFE8 50%, #E9D5FF 100%)

描述: 从左上角的“暖阳黄 (Amber-200)”过渡到中间的“樱花粉 (Pink-200)”，最后到右下角的“丁香紫 (Purple-200)”。

Surface (卡片/容器背景): 半透明的乳白色，模拟磨砂玻璃。

Color: rgba(255, 255, 255, 0.6)

Effect: 需要配合背景模糊 (backdrop-filter: blur(20px)).

Primary Text (主文字): 因为背景亮，文字必须深，但不要纯黑，用深炭灰色。

Color: #1F2937 (Gray-800)

Secondary Text (次级文字):

Color: #6B7280 (Gray-500)

Accent Color (强调色/按钮):

Color: #8B5CF6 (Violet-500) 或纯白按钮带强阴影。

2. 组件样式 (Component Styles)
A. 容器与卡片 (Cards & Containers)

Dark Theme: 锐利的切角、黑色背景、霓虹边框。

Light Theme:

形状: 大圆角 (Radius: 24px 或 XL)。

材质: Glassmorphism (毛玻璃)。白色半透明背景 + 强高斯模糊。

边框: 极细的半透明白色边框 (1px solid rgba(255,255,255, 0.8))，营造“透光感”。

阴影: 柔和的漫射阴影 (box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1)), 让卡片漂浮在渐变背景上。

B. 输入框 (The Prompt Box)

风格: 看起来像一张柔软的纸。

背景: 纯白 (#FFFFFF)，不透明。

阴影: 内部阴影 (inset shadow) 微妙地体现凹陷感，或者扁平化处理带一个彩色光晕 (Focus Ring) 当用户点击时。

文字: 深灰色输入文字，浅灰色 Placeholder。

C. 按钮 (Buttons)

主按钮 (Start):

背景: 纯白 (#FFFFFF)。

文字: 渐变色文字 (Background-clip: text) 或深紫色 (#7C3AED)。

阴影: 强烈的彩色投影 (box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.3)).

参考图中的 "Try Demo" 按钮。

D. 用户摄像头框 (User Camera Frame)

Dark Theme: 科技感的六边形/切角矩形，青色发光边框。

Light Theme:

形状: Squircle (超椭圆) 或标准的圆角矩形。

边框: 粗白色边框 (border: 4px solid white)。

装饰: 像 Instagram Story 的光圈一样。当用户说话时（VAD触发），边框变成 渐变色流动光环 (Gradient Flow)。

Bug

1.在电脑上时电脑由于浏览器屏幕的原因正常布局，avatar视频和文本栏左右分开，但是到手机上的时候视频和文本是上下排列，随着聊天文字的增加，那个记录聊天文本的栏就不断变长，把那个avatar的视频窗口不断向上挤直接给挤没了

2.希望在输入prompt的时候支持选择语种（目前liveavatar支持的有English
Arabic
Bengali
Bulgarian
Chinese
Croatian
Czech
Danish
Dutch
Finnish
French
German
Greek
Hindi
Hungarian
Indonesian
Italian
Japanese
Korean
Malay
Maltese
Norwegian
Polish
Portuguese
Romanian
Russian
Slovak
Spanish
Swedish
Tagalog
Tamil
Turkish
Ukrainian
Vietnamese），然后生成的prompt-polish要和用户所选的语种保持一致

3.最后生成的评分页面能针对聊天的内容给出一些具体的练习建议
