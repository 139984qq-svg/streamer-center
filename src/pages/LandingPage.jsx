import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MagneticButton from '../components/MagneticButton';
import Prism from '../components/Prism';

// ==================== 弹幕素材池 ====================
const danmakuPool = [
  // 数字刷屏类
  '222222222','333333333','666666666','777777777','888888888','999999999',
  '111111111','555555555','2333333','6666666','23333','66666','99999',
  '7777777','8888888','1111111','5555555','22222','33333','44444',
  '123456','654321','520520','1314520','9999999','000000',
  '2222','3333','6666','8888','9999','7777','5555',
  // 火箭/表情重复类
  '🚀🚀🚀×999','🚀🚀🚀🚀🚀','🔥🔥🔥🔥🔥','❤️❤️❤️❤️❤️',
  '⭐⭐⭐⭐⭐','🎉🎉🎉🎉🎉','💪💪💪💪💪','👏👏👏👏👏',
  '😍😍😍😍😍','🌟🌟🌟🌟🌟','💖💖💖💖💖','✨✨✨✨✨',
  '🎊🎊🎊🎊🎊','🎈🎈🎈🎈🎈','🏆🏆🏆🏆🏆','💎💎💎💎💎',
  '🌈🌈🌈🌈🌈','🎵🎵🎵🎵🎵','🎶🎶🎶🎶🎶','🥳🥳🥳🥳🥳',
  '🫶🫶🫶🫶🫶','💫💫💫💫💫','🤩🤩🤩🤩🤩','🦋🦋🦋🦋🦋',
  '🍀🍀🍀🍀🍀','🌸🌸🌸🌸🌸','🎀🎀🎀🎀🎀','💐💐💐💐💐',
  '🔥×999','❤️×999','⭐×999','💎×999','🎉×999',
  // 颜文字类
  '(◕ᴗ◕✿)','(≧▽≦)','(●\'◡\'●)','ヾ(≧▽≦*)o','(๑•̀ㅂ•́)و✧',
  '(灬ºωº灬)♡','(◎▼◎)','( •̀ ω •́ )✧','(ノ◕ヮ◕)ノ*:・゚✧','╰(*°▽°*)╯',
  '(⁄ ⁄•⁄ω⁄•⁄ ⁄)','(✿◡‿◡)','(´▽`ʃ♡ƪ)','♡(ŐωŐ人)','(灬°ω°灬)',
  '(≧∇≦)ﾉ','(☆▽☆)','✧(≖ ◡ ≖✿)','(*≧ω≦)','(ﾉ´ヮ`)ﾉ*: ・゚✧',
  'ε(*´・∀・｀)з゙','(◕‿◕✿)','♪(´▽｀)','(灬ꈍ ꈍ灬)','( ˘ω˘ )♡',
  '(❁´◡`❁)','(✧ω✧)','ψ(｀∇´)ψ','(●ˇ∀ˇ●)','(⌒▽⌒)☆',
  'o(≧v≦)o','(≧◡≦) ♡','ε=(´ο｀*)))','(灬´ิω´ิ灬)','✺◟(∗❛ัᴗ❛ั∗)◞✺',
  // 夸赞唱歌类
  '唱得太好听了！','这嗓音绝了','天籁之音啊','单曲循环级别的','耳朵怀孕了',
  '主播声音好甜','这首歌太适合你了','被惊艳到了','可以出专辑了吧','听哭了',
  '这个高音绝了','好听到起鸡皮疙瘩','副歌太炸了','治愈系嗓音','开口跪',
  '这个转音太绝了','稳的一批','这音色太有辨识度了','戴耳机听更棒','人间天籁',
  '唱功在线！','这情感也太到位了','跟原唱有得一拼','主播出道吧','原地成为粉丝',
  '太有感觉了','这颤音好苏','低音炮啊啊啊','仿佛在听演唱会','好想听现场',
  // 夸赞颜值/才艺类
  '主播好好看','人美声甜','太可爱了吧','这颜值我恋爱了','好看到移不开眼',
  '小姐姐太美了','不愧是我推的主播','眼睛会发光诶','越看越好看','氛围感满分',
  '主播是什么神仙颜值','今天的妆容好绝','这笑容暴击了','又甜又飒','可以当明星了',
  '主播太有魅力了','这才艺是专业的吧','文武双全','颜艺双绝','又美又有才华',
  '这身穿搭好好看','笑起来好治愈','好想捏捏脸','主播今天状态绝了','美貌与实力并存',
  // 互动类
  '来了来了','准时蹲守','今天第一个到','打卡打卡','终于等到开播了',
  '我来晚了吗','刚下班就赶来了','每天准时报到','主播我来了','签到+1',
  '前排占座','沙发！','板凳','地板也行','每天必来',
  '今天抽奖吗','点歌可以吗','主播能唱xx吗','几点下播呀','明天还播吗',
  '关注了关注了','粉丝灯牌亮起来','双击666','分享给朋友了','小心心送上',
  '已转发','拉了三个朋友来看','安利给室友了','已截图发朋友圈','全宿舍在看',
  // 送礼/打赏类
  '大哥出手了！','感谢大佬','土豪666','恭喜上榜','榜一大哥好帅',
  '这波排面拉满','火箭🚀发射！','嘉年华来了','守护团集合','穿云箭！',
  '城堡！城堡！','梦幻城堡来咯','恭喜恭喜','打赏通道打开','贡献榜冲冲冲',
  '这个礼物特效太好看了','大佬真阔气','粉丝团扣1','真·有钱人','今日份的仪式感',
  // 氛围/鼓励类
  '氛围太好了','直播间好热闹','人气爆棚','冲冲冲','越来越有人气了',
  '加油加油','支持主播','永远支持你','你是最棒的','继续努力',
  '太棒了！','厉害了我的主播','好强啊','这操作秀到我了','绝绝子',
  'yyds','主播yyds','永远的神','无敌了','这波可以',
  '我爱这个直播间','好开心啊','笑死我了','太搞笑了吧','肚子笑疼了',
  '哈哈哈哈哈哈','笑出眼泪了','太逗了','被逗乐了','快乐源泉',
  // 游戏直播类
  'GG','MVP','绝了这操作','太秀了','团灭！',
  '这波稳了','逆风翻盘','这个走位太骚了','躲开了！','反杀反杀',
  '五杀！','超神了','这个意识好强','预判到了','天秀',
  'carry全场','大局观','这手速','人机？','太强了吧',
  // 吐槽/搞笑类
  '哈哈哈哈哈','我裂开了','笑不活了','离谱','这也太离谱了',
  '老铁666','稳如老狗','社死现场','太真实了','i了i了',
  '这都行？','绷不住了','不是吧','什么情况','蚌埠住了',
  '无中生有','暗度陈仓','笑拉了','草（日语）','顶不住了',
  '整活了','搁这搁这呢','一整个大动作','家人们谁懂','真的会谢',
  // 晚间/深夜类
  '深夜emo了','夜猫子报到','失眠选手来了','月亮不睡我不睡','听着就犯困了好治愈',
  '梦游到直播间','该睡了但舍不得退','再看五分钟就睡','我的电子安眠药','白噪音直播间',
  // 节奏类/口号类
  '冲鸭！','奥利给','芜湖起飞','一波肥','带带带',
  '稳住稳住','别急别急','还有机会','相信主播','坚持就是胜利',
  '让我们一起','三二一上链接','开始了开始了','要来了要来了','预备——',
  '安排！','走着','说走就走','上号！','集合集合',
  // 平台/直播梗
  '感谢关注','欢迎新来的朋友','老粉路过','一年了还在看','日常打卡',
  '弹幕不能停','刷起来','让我看看弹幕','互动一下嘛','冒个泡',
  '潜水党出来','别光看不说话','打字太慢了','来不及打字','话在心里口难开',
  'awsl','xswl','u1s1','yyds','绝绝子',
  '这真的可以','可以但没必要','我直接好家伙','一整个无语住','DNA动了',
  // 特殊格式类
  '🎤🎵 开唱了！','💃 舞起来','🎮 开打开打','📢 关注不迷路',
  '🏠 欢迎回家','☕ 边喝边看','🍿 搬好小板凳','📱 横屏更舒服',
  '🎁 今日份好运','💌 比心比心','🌙 晚安','☀️ 早安打工人',
  '🐶 汪汪队到','🐱 喵呜~','🦊 可爱！','🐻 熊出没',
  '💯💯💯','🔝🔝🔝','👑👑👑','🏅🏅🏅',
  // 更多补充
  '这背景音乐是什么','歌名叫什么','求歌单','主播品味好好','这选歌',
  '仿佛置身演唱会','直播间质量太高了','每天的快乐源泉','晚上不看睡不着',
  '主播辛苦了','注意休息','多喝水','嗓子注意保护','爱了爱了',
  '追了好几个月了','从十几个人看到现在','见证成长','恭喜涨粉','百万粉指日可待',
  '有内味了','这氛围绝了','太chill了','好vibes','松弛感拉满',
  '谁还没来赶紧的','叫上你的小伙伴','在线等一个关注','求求了点个关注吧','白嫖也要留个赞啊',
  // 热梗/流行语补充
  '遥遥领先','科目三跳起来','命运的齿轮开始转动','泰裤辣','你个老六',
  '尊嘟假嘟','我真的栓Q','完美','挖呀挖呀挖','公主请上车',
  '哇塞','你好厉害','respect','拿捏了','满分',
  '太A了','又A又飒','差点以为在看综艺','综艺效果拉满','看不够',
  // 美食/生活类
  '边吃外卖边看','奶茶续命中','泡面搭配直播','深夜放毒','看饿了',
  '这就是我的下饭视频','干饭人干饭魂','今天的快乐餐','配火锅绝了','减肥明天开始',
  // CP/嗑学类
  '磕到了磕到了','好甜','发糖了','这对我站了','官方认证',
  '甜度超标','含糖量爆表','姨母笑','好嗑','我的CP',
  // 季节/节日类
  '新年快乐','恭喜发财','红包来','过年氛围感','跨年一起看',
  '情人节快乐','双十一剁手','圣诞氛围','万圣节搞怪','中秋团圆',
  // 更多表情组合
  '(ง •̀_•́)ง 加油','(╯°□°）╯︵ ┻━┻','┬─┬ノ( º _ ºノ)','( ͡° ͜ʖ ͡°)','¯\\_(ツ)_/¯',
  '(づ｡◕‿‿◕｡)づ','(っ˘ω˘ς)','٩(◕‿◕｡)۶','(ﾉ>ω<)ﾉ','(｡♥‿♥｡)',
  // 语气词/短反馈
  '啊啊啊啊啊','嗷嗷嗷','呜呜呜好好听','救命','我的天',
  '绝了绝了','真的假的','不会吧','卧槽','妈呀',
  '好家伙','离大谱','刺激','太刺激了','心脏受不了'
];

const danmakuColors = [
  '#ffffff','#ffe066','#a8ff78','#78ffd6','#88d8ff',
  '#d4a5ff','#ffb3ba','#baffc9','#bae1ff','#ffffba',
  '#ffd6e7','#c3fae8','#d0ebff','#fff3bf','#e6fcf5'
];

const danmakuSizes = ['13px','14px','15px','16px','17px','18px','20px','22px'];

// 工具函数
function randomRange(min, max) { return Math.random() * (max - min) + min; }
function randomInt(min, max) { return Math.floor(randomRange(min, max + 1)); }
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const danmakuRef = useRef(null);
  const usedIndicesRef = useRef(new Set());
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);

  const totalSlides = 4;
  const bgImages = ['/bg1.jpg', '/bg2.jpg', '/bg3.png', '/bg4.png'];

  // 页面进入动画
  useEffect(() => {
    requestAnimationFrame(() => setPageLoaded(true));
  }, []);

  // 背景轮播
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  // 弹幕系统
  useEffect(() => {
    const container = danmakuRef.current;
    if (!container) return;

    const usedIndices = usedIndicesRef.current;

    function getUniqueBarrage(count) {
      const result = [];
      const available = [];
      for (let i = 0; i < danmakuPool.length; i++) {
        if (!usedIndices.has(i)) available.push(i);
      }
      if (available.length < count) {
        usedIndices.clear();
        for (let i = 0; i < danmakuPool.length; i++) available.push(i);
      }
      const shuffled = shuffleArray(available).slice(0, count);
      shuffled.forEach(idx => {
        usedIndices.add(idx);
        result.push(danmakuPool[idx]);
      });
      return result;
    }

    function createDanmaku(text, options = {}) {
      const el = document.createElement('div');
      el.className = 'danmaku-item';
      el.textContent = text;
      el.style.color = options.color || danmakuColors[randomInt(0, danmakuColors.length - 1)];
      el.style.fontSize = options.size || danmakuSizes[randomInt(0, danmakuSizes.length - 1)];

      if (options.type === 'pop') {
        el.classList.add('pop');
        el.style.top = randomRange(25, 70) + '%';
        el.style.setProperty('--pop-duration', randomRange(2.5, 4) + 's');
        el.style.fontSize = randomRange(18, 28) + 'px';
        el.style.fontWeight = '700';
      } else {
        el.classList.add('scroll');
        el.style.left = '0';
        el.style.top = randomRange(12, 82) + '%';
        el.style.setProperty('--duration', randomRange(7, 12) + 's');
        el.style.setProperty('--opacity', randomRange(0.5, 0.85).toFixed(2));
      }

      container.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }

    function getDensityAtTime(elapsed) {
      const t = elapsed / 1000;
      if (t < 2) return randomRange(1, 2);
      if (t < 4) return randomRange(3, 4);
      if (t < 7) return randomRange(5, 7);
      if (t < 9) return randomRange(3, 4);
      return randomRange(1, 2);
    }

    const ROUND_DURATION = 10000;
    const TOTAL_ROUNDS = 5;
    let currentRound = 0;
    let cancelled = false;

    function runRound() {
      if (cancelled) return;
      const startTime = performance.now();
      let lastEmit = 0;
      let popCount = 0;
      const maxPops = randomInt(2, 4);
      const popTimes = [];
      for (let i = 0; i < maxPops; i++) popTimes.push(randomRange(3500, 7500));
      popTimes.sort((a, b) => a - b);

      function emitFrame() {
        if (cancelled) return;
        const elapsed = performance.now() - startTime;
        if (elapsed >= ROUND_DURATION) {
          currentRound++;
          if (currentRound < TOTAL_ROUNDS) {
            setTimeout(runRound, 1000);
          } else {
            setTimeout(() => { currentRound = 0; usedIndices.clear(); runRound(); }, 3000);
          }
          return;
        }
        const density = getDensityAtTime(elapsed);
        const interval = 1000 / density;
        if (elapsed - lastEmit >= interval) {
          const texts = getUniqueBarrage(1);
          if (texts.length > 0) createDanmaku(texts[0], { type: 'scroll' });
          lastEmit = elapsed;
        }
        if (popCount < popTimes.length && elapsed >= popTimes[popCount]) {
          const popTexts = getUniqueBarrage(1);
          if (popTexts.length > 0) createDanmaku(popTexts[0], { type: 'pop' });
          popCount++;
        }
        animFrameRef.current = requestAnimationFrame(emitFrame);
      }
      animFrameRef.current = requestAnimationFrame(emitFrame);
    }

    const startTimeout = setTimeout(() => runRound(), 1500);

    return () => {
      cancelled = true;
      clearTimeout(startTimeout);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // 导航到主播中心
  const navigateToApp = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  }, [navigate]);

  // 切换轮播
  const goToSlide = (index) => {
    clearInterval(timerRef.current);
    setCurrentSlide(index);
    timerRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 5000);
  };

  return (
    <div style={{ opacity: pageLoaded ? 1 : 0, transition: 'opacity 1s ease-out' }}>
      <section className="hero" style={heroStyle}>
        {/* 背景轮播 */}
        <div style={heroBgStyle}>
          {bgImages.map((img, i) => (
            <div
              key={i}
              style={{
                ...slideStyle,
                backgroundImage: `url(${img})`,
                opacity: i === currentSlide ? 1 : 0,
              }}
            />
          ))}
          {/* Prism 棱镜光效叠加层 */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, mixBlendMode: 'screen', opacity: 0.6, pointerEvents: 'none' }}>
            <Prism
              animationType="rotate"
              timeScale={0.5}
              height={3.5}
              baseWidth={5.5}
              scale={3.6}
              hueShift={0}
              colorFrequency={1}
              noise={0}
              glow={1}
              transparent={true}
            />
          </div>
          <div style={overlayStyle} />
        </div>

        {/* 弹幕容器 */}
        <div ref={danmakuRef} style={danmakuContainerStyle} />

        {/* 顶部导航栏 */}
        <nav style={navbarStyle}>
          <a href="#" style={navBrandStyle} onClick={e => e.preventDefault()}>
            <div style={logoIconStyle}>
              <img src="/logo.png" alt="捞月狗" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span>捞月狗</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <MagneticButton strength={0.3}>
              <a href="#" onClick={e => { e.preventDefault(); navigateToApp(); }} className="nav-link-hover" style={navLinkStyleLg}>首页</a>
            </MagneticButton>
            <MagneticButton strength={0.3}>
              <a href="https://www.laoyuegou.com/" target="_blank" rel="noopener noreferrer" className="nav-link-hover" style={navLinkStyleLg}>捞月狗官网</a>
            </MagneticButton>
          </div>
        </nav>

        {/* 正中内容 */}
        <div style={heroContentStyle}>
          <div style={badgeStyle}>
            <span style={badgeDotStyle} />
            <span>全新主播成长平台已上线</span>
          </div>
          <h1 style={heroTitleStyle}>让每一场直播<br />都值得被看见</h1>
          <p style={heroDescStyle}>
            一个让你偷偷变强的地方
          </p>
          <MagneticButton strength={0.25}>
            <div style={btnHeroWrapStyle}>
              <div style={btnPulseStyle} />
              <div style={btnGlowStyle} />
              <button onClick={navigateToApp} style={btnHeroStyle}>
                主播中心
              </button>
            </div>
          </MagneticButton>
        </div>

        {/* 轮播指示器 */}
        <div style={slideIndicatorsStyle}>
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                ...dotStyle,
                ...(i === currentSlide ? dotActiveStyle : {}),
              }}
            />
          ))}
        </div>
      </section>

      {/* 页面切换遮罩 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#FFFBFE',
        opacity: transitioning ? 1 : 0,
        pointerEvents: transitioning ? 'all' : 'none',
        transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1)',
      }} />

      {/* 弹幕动画样式 */}
      <style>{danmakuCSS}</style>
    </div>
  );
}

// ==================== 样式定义 ====================
const heroStyle = {
  position: 'relative', width: '100%', height: '100vh',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  background: '#0e100f',
};

const heroBgStyle = {
  position: 'absolute', inset: 0, zIndex: 0,
};

const slideStyle = {
  position: 'absolute', inset: 0,
  transition: 'opacity 1.5s ease-in-out',
  backgroundSize: 'cover', backgroundPosition: 'center',
};

const overlayStyle = {
  position: 'absolute', inset: 0, zIndex: 1,
  background: 'linear-gradient(180deg, rgba(14,16,15,0.55) 0%, rgba(14,16,15,0.15) 35%, rgba(14,16,15,0.25) 70%, rgba(14,16,15,0.85) 100%)',
};

const danmakuContainerStyle = {
  position: 'absolute', inset: 0, zIndex: 3, overflow: 'hidden', pointerEvents: 'none',
};

const navbarStyle = {
  position: 'relative', zIndex: 10,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '20px 60px',
  background: 'rgba(14, 16, 15, 0.6)',
  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
};

const navBrandStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  fontSize: '18px', fontWeight: 600, letterSpacing: '1px',
  color: '#fff', textDecoration: 'none',
};

const logoIconStyle = {
  width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden',
};

const navMenuStyle = {
  display: 'flex', alignItems: 'center', gap: '36px', listStyle: 'none',
  margin: 0, padding: 0,
};

const navLinkStyle = {
  color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none',
  fontSize: '14px', fontWeight: 400, letterSpacing: '0.5px',
};

const navLinkStyleLg = {
  color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none',
  fontSize: '16px', fontWeight: 500, letterSpacing: '0.5px',
  fontFamily: "'Rounded Mplus 1c', 'PingFang SC', 'Microsoft YaHei', sans-serif",
};

const navCtaStyle = {
  padding: '9px 22px', borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: '#fff', fontSize: '13px', fontWeight: 500,
  cursor: 'pointer', textDecoration: 'none',
};

const heroContentStyle = {
  position: 'relative', zIndex: 5, flex: 1,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  textAlign: 'center', padding: '0 40px',
  cursor: 'default', userSelect: 'none',
};

const badgeStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '6px 16px', borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: '28px', backdropFilter: 'blur(10px)',
};

const badgeDotStyle = {
  width: '6px', height: '6px', borderRadius: '50%',
  background: '#2fee65', animation: 'pulse 2s infinite',
};

const heroTitleStyle = {
  fontSize: 'clamp(38px, 5.5vw, 64px)', fontWeight: 700,
  lineHeight: 1.15, letterSpacing: '-1px', marginBottom: '20px',
  background: 'linear-gradient(90deg, #2fee65, #9ffff3, #ffffff, #c9f6b4, #2fee65)',
  backgroundSize: '300% 100%',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'gradient-flow 6s linear infinite',
};

const heroDescStyle = {
  fontSize: '16px', lineHeight: 1.7,
  color: 'rgba(255, 255, 255, 0.9)',
  textShadow: '0 1px 8px rgba(0,0,0,0.5)',
  maxWidth: '520px', marginBottom: '40px',
};

const btnHeroWrapStyle = {
  position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

const btnHeroStyle = {
  position: 'relative', padding: '16px 48px', borderRadius: '3rem',
  border: 'none', cursor: 'pointer', fontSize: '17px', fontWeight: 700,
  letterSpacing: '2px', color: '#0e100f',
  background: 'radial-gradient(89% 85% at 17% 78%, #fbfefa 0%, #c9f6b4 40%, #abff84 78%, #2fee65 100%)',
  boxShadow: '0 0 20px rgba(47, 238, 101, 0.4), 0 0 60px rgba(47, 238, 101, 0.15)',
  zIndex: 2,
};

const btnGlowStyle = {
  position: 'absolute', inset: '-3px', borderRadius: '3rem',
  background: 'conic-gradient(from var(--angle, 0deg), #2fee65, #abff84, #c9f6b4, #fbfefa, #c9f6b4, #abff84, #2fee65)',
  zIndex: 1, opacity: 0.7, filter: 'blur(8px)',
  animation: 'glow-spin 4s linear infinite',
};

const btnPulseStyle = {
  position: 'absolute', inset: '-8px', borderRadius: '3rem',
  background: 'radial-gradient(ellipse at center, rgba(47, 238, 101, 0.3) 0%, transparent 70%)',
  zIndex: 0, animation: 'btn-pulse-anim 3s ease-in-out infinite',
};

const slideIndicatorsStyle = {
  position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
  zIndex: 10, display: 'flex', gap: '8px',
};

const dotStyle = {
  width: '8px', height: '8px', borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.3)', cursor: 'pointer',
  transition: 'all 0.4s ease',
};

const dotActiveStyle = {
  background: '#2fee65',
  boxShadow: '0 0 8px rgba(47, 238, 101, 0.6)',
  transform: 'scale(1.3)',
};

// ==================== 弹幕 CSS ====================
const danmakuCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');

  .danmaku-item {
    position: absolute;
    white-space: nowrap;
    font-family: 'Space Grotesk', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-weight: 500;
    color: #ffffff;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.3);
    opacity: 0;
    will-change: transform, opacity;
  }

  .danmaku-item.scroll {
    animation: danmaku-scroll var(--duration, 8s) linear forwards;
  }

  .danmaku-item.pop {
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: danmaku-pop var(--pop-duration, 3s) cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  @keyframes danmaku-scroll {
    0% { transform: translateX(-100%); opacity: 0; }
    3% { opacity: var(--opacity, 0.75); }
    92% { opacity: var(--opacity, 0.75); }
    100% { transform: translateX(calc(100vw + 100%)); opacity: 0; }
  }

  @keyframes danmaku-pop {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
    15% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
    25% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
    75% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
    100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @keyframes gradient-flow {
    0% { background-position: 0% 50%; }
    100% { background-position: 300% 50%; }
  }

  @keyframes glow-spin {
    to { --angle: 360deg; }
  }

  @keyframes btn-pulse-anim {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.15); opacity: 0.2; }
  }

  @property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .nav-link-hover {
    position: relative;
    transition: color 0.3s ease, text-shadow 0.3s ease;
  }
  .nav-link-hover:hover {
    color: #ffffff !important;
    text-shadow: 0 0 12px rgba(47, 238, 101, 0.6), 0 0 4px rgba(255,255,255,0.3);
  }
  .nav-link-hover::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #2fee65, #abff84);
    border-radius: 1px;
    transition: width 0.3s ease, left 0.3s ease;
    box-shadow: 0 0 6px rgba(47, 238, 101, 0.4);
  }
  .nav-link-hover:hover::after {
    width: 100%;
    left: 0;
  }

  .nav-cta-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nav-cta-hover:hover {
    background: rgba(47, 238, 101, 0.15) !important;
    border-color: rgba(47, 238, 101, 0.5) !important;
    color: #2fee65 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(47, 238, 101, 0.2), 0 0 8px rgba(47, 238, 101, 0.1);
  }
`;
