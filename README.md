# 萌学园 v0.3

网页：<https://bennyli16888.github.io/smart-kid/>

面向幼儿的原创萌宠启蒙课堂，无账号、广告或计时。10 个动物伙伴各有自己的全站配色和课堂主题，提供语文、数学、英语和经典儿歌。

| 科目 | 简单 | 进阶 | 挑战 |
| --- | --- | --- | --- |
| 语文 | 基础汉字及拼音 | 常见词语 | 生活短语 |
| 数学 | 10以内加减法 | 20以内加减法 | 自定义1—100以内 |
| 英语 | 身边物品 | 家与自然 | 日常生活 |

语文、英语每科各 90 个字词，每个难度 30 个，配有 SVG 或系统 Emoji 图片。题量提供 10、20、自定义（1—100）。默认不重复；勾选“可重复巩固”后展开 10% / 20% / 30% 比例。例如 20 次、30% 重复，包含 14 个不同字词及 6 次额外重复。重复次数四舍五入；不同字词需求超过材料数量时会提示调整，不会暗中重复或减少数量。

数学随机生成指定数量的不重复题目，数字和结果均不超出所选范围，没有负数。范围太小无法提供足量不同题目时会明确提示。每道题可使用五彩糖果、香蕉、苹果、橙子、草莓、葡萄、梨、桃子、西瓜或樱桃讲解：先摆好 → 拿来或拿走 → 数剩余实物，文字、画面和朗读保持一致。实物可点击报数，拿走的打叉。答错可以重试，答对或完成字词学习获得一颗星星；进度仅存在当前浏览器。

## 经典儿歌与授权

按“只加入逐首核实允许公开分发的演唱录音，数量不足也接受”的原则，目前收录 **3 首英文儿歌**：Twinkle, Twinkle, Little Star、Incy Wincy Spider、Wind the Bobbin Up。暂未核实到适合收录的中文经典儿歌演唱录音，中文分类明确显示待补充，不使用无授权录音凑数。清唱录音不是商业录音室版本。

音频位于 `audio/songs/`，播放不请求外部播放器或音乐服务。切换科目、返回首页、切换角色、关闭声音或切到后台会暂停播放。曲目界面显示作者、授权、来源及加工说明；完整曲目元数据位于 `js/songs.js`。

| 音频 | 演唱录音来源 | 许可 | 处理 |
| --- | --- | --- | --- |
| `twinkle.mp3` | [Dcoetzee](https://commons.wikimedia.org/wiki/File:Twinkle_Twinkle_Little_Star_-_sung_with_full_lyrics.ogg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | OGG 转 MP3，未剪辑 |
| `spider.mp3` | [Mvolz](https://commons.wikimedia.org/wiki/File:Insey_winsey_spider_song_video.webm) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 提取音轨、转 MP3，未剪辑 |
| `bobbin.mp3` | [Mvolz](https://commons.wikimedia.org/wiki/File:Wind_the_bobbin_up.webm) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 提取音轨、转 MP3，未剪辑 |

后两首音轨继续以 CC BY-SA 4.0 提供，不代表整个网站代码改为该许可。授权核查日期：2026-11-10。CC0、公版及开放许可不能保证不存在任何第三方权利问题；新增曲目应分别核实词曲与录音，不把“免费下载”“免版税”当作公开分发许可。

## 声音

首次打开不会自动播放（浏览器限制），可点右上角声音开关，或直接点课堂里的 **“听一听”**。首页不显示声音试听和说明面板。字词、英文单词、0—100 的数字和讲解使用随网站提供的 306 个 MP3，不需要设备安装中英文语音库，也不在使用时请求外部朗读服务。全站只有一个固定合成童声，不再提供音色选择。全站开关可以关闭自动跟读；明确点击“听一听”会重新开启。

如果听不到，检查设备媒体音量、静音模式和网络。仅在播放被拦截或音频加载失败时，于课堂“听一听”下显示提示；正常播放和关闭声音时不显示状态说明。不切换到未经核实的设备声音。

少数容易混淆的孤立字词使用简短例句辅助发音，例如“口，开口的口”和“This is a shirt”。减法读作“减去”，避免单个“减”字发音不清。

朗读会在浏览器中去掉音频首尾的长留白，缓存当前和下一题的读音，再将数学问题及单个讲解步骤拼成一段连续音频，避免逐词等待加载。保留短接缝和发音安全边距；不支持解码的浏览器会退回原 MP3。

声音使用 [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS) 在本地离线生成：VoiceDesign 1.7B 创建原创合成参考声音，再由 Base 0.6B 复用同一参考生成中英文。模型标注 [Apache-2.0](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base)，允许商用；不使用真实儿童录音或模仿指定人物，也不靠调速调高音调冒充童声。自然度、童声效果和情感表现仍需实际试听评价，不保证与真人无差别。

`audio/voice-reference.wav` 保留原创合成参考，`audio/provenance.json` 记录生成模型、提示词和逐文件校验值。旧版 Google 翻译读音不再作为生成来源。可选重生成（需要 Python 3.11+、Node.js，首次联网下载模型；CPU 很慢，建议使用有足够内存的机器）：

```bash
uv venv --python 3.11 .venv-tts
uv pip install --python .venv-tts/bin/python --torch-backend cpu -r test/tts-requirements.txt
.venv-tts/bin/python test/generate-audio.py --only hello --force
.venv-tts/bin/python test/generate-audio.py
```

无需为网站部署模型或 Python 环境。脚本只在本机推理，不向第三方朗读服务发送文字；已生成且输入、校验均匹配的文件会跳过。`--only` 可指定逗号分隔的多个音频 ID，`--force` 可重新生成需要复查的片段。

## 本地运行和部署

```bash
python3 -m http.server 8000
```

打开 <http://localhost:8000/>。手机和电脑在同一局域网时，手机也可访问 `http://电脑局域网地址:8000/`（需允许防火墙访问）。本地直接双击 HTML 时，浏览器可能限制音频加载，推荐使用本地服务。

GitHub Pages 使用 `main` 分支根目录；必须一并上传 `index.html`、`css/`、`js/` 和 `audio/`。所有资源为相对路径，支持仓库子路径。

## 验证

```bash
node test/content.js
node test/audio.js
node test/smoke.js
```

后者需要 Node.js 22 和 `chromium-browser`，无 npm 依赖。检查实际朗读和三首儿歌播放、播放拦截提示、角色主题、默认不重复、重复比例、自定义数量/数字范围、10 种实物讲解和手机/电脑布局。内容测试还验证逐文件生成记录与校验值。自动化无法确认用户设备扬声器的实际音量或主观音色质量。

UI 的方格纸、粗描边和贴纸按钮借鉴 Bunny Math 的设计方向；未复制其角色或代码，图案和界面在本项目独立制作。
