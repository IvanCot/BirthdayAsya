/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Clock, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ChevronDown, 
  X, 
  Gift, 
  BookOpen, 
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CONFIG } from "./data";

interface FloatingHeart {
  id: number;
  x: number; // горизонтальная позиция в процентах
  size: number; // размер в пикселях
  delay: number; // задержка анимации
  duration: number; // длительность анимации
  styleType: number; // стиль волны
}

interface InteractiveHeart {
  id: number;
  x: number; // координата X клика или случайная
  y: number; // координата Y клика или случайная
  size: number;
  color: string;
}

// ==========================================
// НАСТРОЙКИ КОЛИЧЕСТВА ДЕКОРАТИВНЫХ ЭЛЕМЕНТОВ
// Вы можете легко изменить количество фоновых сердечек, звёздочек и анимаций ниже!
// ==========================================
export const ANIMATION_SETTINGS = {
  backgroundHeartsCount: 110,   // Количество медленно плывущих сердечек на всем фоне (по умолчанию было 75, теперь 110)
  backgroundStarsCount: 70,     // Количество нежных мерцающих звёздочек на фоне (было 45, теперь 70)
  footerHeartsLeftCount: 32,    // Количество взлетающих сердечек у левого края экрана в самом конце (финале)
  footerHeartsRightCount: 32,   // Количество взлетающих сердечек у правого края экрана в самом конце (финале)
  clickExplosionHeartCount: 35, // Количество разлетающихся сердечек в одном взрыве при нажатии на кнопки или тепло
};

export default function App() {
  const [timePassed, setTimePassed] = useState({
    years: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Состояния для интерактивных диалогов / эффектов
  const [selectedMemory, setSelectedMemory] = useState<typeof CONFIG.memories[0] | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeCompliment, setActiveCompliment] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showWarmth, setShowWarmth] = useState(false);
  const [showSomething, setShowSomething] = useState(false);
  
  // Клик-сердечки (для взрыва)
  const [clickHearts, setClickHearts] = useState<InteractiveHeart[]>([]);

  // Счётчики для случайной генерации ID сердечек
  const heartIdCounter = useRef(0);

  // Сброс индекса изображения карусели при смене воспоминания
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedMemory]);

  // Рассчитать время, прошедшее с рождения (или памятной даты)
  useEffect(() => {
    const calculateTime = () => {
      const birth = new Date(CONFIG.birthDate);
      const now = new Date();
      
      let years = now.getFullYear() - birth.getFullYear();
      
      const tempBirthThisYear = new Date(birth);
      tempBirthThisYear.setFullYear(now.getFullYear());
      
      if (now.getTime() < tempBirthThisYear.getTime()) {
        years--;
      }
      const lastAnniversary = new Date(birth);
      lastAnniversary.setFullYear(birth.getFullYear() + years);
      
      const diff = now.getTime() - lastAnniversary.getTime();
      
      if (diff <= 0) {
        setTimePassed({years, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const msecInSecond = 1000;
      const msecInMinute = 60 * msecInSecond;
      const msecInHour = 60 * msecInMinute;
      const msecInDay = 24 * msecInHour;

      const days = Math.floor(diff / msecInDay);
      const hours = Math.floor((diff % msecInDay) / msecInHour);
      const minutes = Math.floor((diff % msecInHour) / msecInMinute);
      const seconds = Math.floor((diff % msecInMinute) / msecInSecond);
      
      let yearspan = "Лет";
      if (years % 100 >= 11 && years % 100 <= 14) {
          yearspan = "Лет";
      } else if (years % 10 === 1) {
          yearspan = "Год";
      } else if ([2, 3, 4].includes(years % 10)) {
          yearspan = "Года";
      } else {
          yearspan = "Лет";
      }

      let dayspan = "Дней";
      if (days % 100 >= 11 && days % 100 <= 14) {
          dayspan = "Дней";
      } else if (days % 10 === 1) {
          dayspan = "День";
      } else if ([2, 3, 4].includes(days % 10)) {
          dayspan = "Дня";
      } else {
          dayspan = "Дней";
      }

      let hourspan = "Часов";
      if (hours % 100 >= 11 && hours % 100 <= 14) {
          hourspan = "Часов";
      } else if (hours % 10 === 1) {
          hourspan = "Час";
      } else if ([2, 3, 4].includes(hours % 10)) {
          hourspan = "Часа";
      } else {
          hourspan = "Часов";
      }

      let minutespan = "Минут";
      if (minutes % 100 >= 11 && minutes % 100 <= 14) {
          minutespan = "Минут";
      } else if (minutes % 10 === 1) {
          minutespan = "Минута";
      } else if ([2, 3, 4].includes(minutes % 10)) {
          minutespan = "Минуты";
      } else {
          minutespan = "Минут";
      }

      let secondspan = "Секунд";
      if (seconds % 100 >= 11 && seconds % 100 <= 14) {
          secondspan = "Секунд";
      } else if (seconds % 10 === 1) {
          secondspan = "Секунда";
      } else if ([2, 3, 4].includes(seconds % 10)) {
          secondspan = "Секунды";
      } else {
          secondspan = "Секунд";
      }
      setTimePassed({yearspan, dayspan, hourspan, minutespan, secondspan, years, days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Эффект взрыва сердечек (при нажатии на '❤️ Твоё тепло' или просто кликах)
  const triggerHeartExplosion = (clientX?: number, clientY?: number) => {
    const startX = clientX || window.innerWidth / 2;
    const startY = clientY || window.innerHeight * 0.8;
    
    const colors = [
      "#ff4d62", // romantic primary
      "#ff7584", // light pink
      "#ffadb6", // pastel pink
      "#ffd1d6", // lighter coral
      "#ffccd5", // aesthetic warm rose
      "#e6223b"  // deep red
    ];

    const newHearts: InteractiveHeart[] = [];
    for (let i = 0; i < ANIMATION_SETTINGS.clickExplosionHeartCount; i++) {
      heartIdCounter.current += 1;
      newHearts.push({
        id: heartIdCounter.current,
        // слегка рассеиваем по горизонтали и вертикали
        x: startX + (Math.random() - 0.5) * 40,
        y: startY + (Math.random() - 0.5) * 40,
        size: Math.random() * 24 + 12,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    setClickHearts(prev => [...prev, ...newHearts]);

    // очищаем старые сердечки через некоторое время после окончания анимации
    setTimeout(() => {
      setClickHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
    }, 2500);
  };

  // Получить случайный комплимент
  const showRandomCompliment = () => {
    const arr = CONFIG.interactiveButtons.more.compliments;
    let index = Math.floor(Math.random() * arr.length);
    // Избегаем повторения текущего комплимента подряд
    if (activeCompliment && arr.length > 1) {
      while (arr[index] === activeCompliment) {
        index = Math.floor(Math.random() * arr.length);
      }
    }
    setActiveCompliment(arr[index]);
    triggerHeartExplosion();
  };

  // Фоновые медленно плывущие сердечки (создаем массив с дефолтными параметрами из ANIMATION_SETTINGS)
  const backgroundHearts: FloatingHeart[] = useMemo(() => {
    return Array.from({ length: ANIMATION_SETTINGS.backgroundHeartsCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 92 + 4, // отступы по краям
      size: Math.random() * 18 + 10,
      delay: Math.random() * 10,
      duration: Math.random() * 12 + 8, // плывут медленно, от 8 до 20 секунд
      styleType: Math.floor(Math.random() * 3) + 1
    }));
  }, []);

  // Фоновые нежные мерцающие звездочки (из ANIMATION_SETTINGS)
  const backgroundStars = useMemo(() => {
    return Array.from({ length: ANIMATION_SETTINGS.backgroundStarsCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 94 + 3,
      y: Math.random() * 90 + 5,
      size: Math.random() * 10 + 6,
      delay: Math.random() * 10,
      duration: Math.random() * 5 + 4, // 4-9 секунд цикл мерцания
    }));
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-romantic-200 selection:text-romantic-600 overflow-hidden" style={{ backgroundImage: "radial-gradient(circle at 0% 0%, #fff5f7 0%, #ffe4eb 50%, #fce7f3 100%)" }}>
      
      {/* 1. ФОН С СВЕТЯЩИМИСЯ И ЭСТЕТИЧНЫМИ ОРБАМИ (Pinterest Glow) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-glow-orb-1 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] bg-glow-orb-2 rounded-full blur-[110px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[60%] bg-glow-orb-3 rounded-full blur-[120px]" />
      </div>

      {/* 2. ФОНОВЫЕ СЦЕНИЧЕСКИЕ ИСКОРКИ */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {backgroundStars.map((s) => (
          <Sparkles
            key={`star-${s.id}`}
            className="absolute text-pink-400/25 animate-twinkle"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      {/* 3. ФОНОВЫЙ ПОТОК ПЛЫВУЩИХ СЕРДЕЧЕК */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {backgroundHearts.map((h) => {
          const speedClass = h.duration < 11 ? "animate-float-fast" : h.duration < 16 ? "animate-float-medium" : "animate-float-slow";
          return (
            <svg
              key={h.id}
              className={`absolute bottom-[-50px] text-pink-300/25 fill-current ${speedClass}`}
              style={{
                left: `${h.x}%`,
                width: `${h.size}px`,
                height: `${h.size}px`,
                animationDelay: `${h.delay}s`,
                animationDuration: `${h.duration}s`,
              }}
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          );
        })}
      </div>

      {/* 4. ВСПЛЫВАЮЩИЕ СУПЕР-ИНТЕРАКТИВНЫЕ КЛИК-СЕРДЕЧКИ */}
      <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
        <AnimatePresence>
          {clickHearts.map(ch => (
            <motion.div
              key={ch.id}
              initial={{ opacity: 1, scale: 0.1, x: ch.x, y: ch.y }}
              animate={{ 
                opacity: [1, 0.9, 0.6, 0], 
                scale: [0.3, 1.2, 1.5, 0.8],
                x: ch.x + (Math.random() - 0.5) * 350,
                y: ch.y - Math.random() * 450 - 150,
                rotate: (Math.random() - 0.5) * 180
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute pointer-events-none text-center"
              style={{ top: 0, left: 0, color: ch.color }}
            >
              <Heart size={ch.size} strokeWidth={1} fill="currentColor" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* ======================== 
            HERO SCREEN (Раздел 1)
           ======================== */}
        <section className="min-h-screen flex flex-col justify-between py-8 relative z-10 lg:px-8">
          {/* Header element to match Sleek design */}
          <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center sm:items-end w-full gap-4 border-b border-rose-200/30 pb-6 mb-6">
            <div className="flex flex-col text-center sm:text-left">
              <span className="text-romantic-600 font-medium tracking-[0.2em] uppercase text-xs mb-2">Birthday Edition 2026</span>
              <h2 className="text-3xl font-serif italic text-romantic-900 tracking-tight leading-none">
                Nastya's <span className="text-romantic-500 underline decoration-rose-200 underline-offset-8">Love Story</span> ❤️
              </h2>
            </div>
            <div className="flex gap-3">
              <button onClick={() => triggerHeartExplosion()} className="w-11 h-11 rounded-full border border-pink-200/60 flex items-center justify-center text-romantic-500 bg-white/65 backdrop-blur-md shadow-sm cursor-pointer hover:scale-110 active:scale-95 hover:bg-white transition-all">✨</button>
              <button onClick={() => setShowSomething(true)} className="w-11 h-11 rounded-full border border-pink-200/60 flex items-center justify-center text-romantic-500 bg-white/65 backdrop-blur-md shadow-sm cursor-pointer hover:scale-110 active:scale-95 hover:bg-white transition-all">💌</button>
            </div>
          </header>

          {/* Центральный романтичный блок */}
          <div className="text-center my-auto px-2 max-w-4xl mx-auto flex flex-col items-center">
            
            {/* Анимированный маленький шильдик */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-panel border border-pink-200/50 shadow-xs mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-romantic-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase text-romantic-600 font-sans">
                Сайт-сюрприз специально для тебя
              </span>
            </motion.div>

            {/* Заголовок */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="text-4.5xl sm:text-5.5xl md:text-7xl font-serif italic text-romantic-600 font-bold tracking-tight glow-text mb-6 mt-2 leading-[1.12]"
            >
              С Днем рождения, <span className="text-romantic-500 underline decoration-pink-200/80 underline-offset-10 decoration-4">Настенька</span> ❤️
            </motion.h1>

            {/* Описание */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.7 }}
              className="text-base sm:text-lg md:text-xl text-stone-600 max-w-2xl font-sans font-light leading-relaxed mb-10"
            >
              {CONFIG.hero.subtitle}
            </motion.p>

            {/* Кнопка запуска */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1 }}
            >
              <button
                onClick={(e) => {
                  triggerHeartExplosion(e.clientX, e.clientY);
                  document.getElementById("timer-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="shimmer-btn px-8 py-4 rounded-full bg-linear-to-r from-romantic-400 to-romantic-500 hover:from-romantic-500 hover:to-romantic-600 text-white font-medium text-base shadow-lg shadow-pink-200/50 hover:shadow-pink-300/60 ring-2 ring-white/20 scale-100 hover:scale-[1.04] transition-all cursor-pointer flex items-center gap-2"
                id="main-cta-button"
              >
                <Gift className="w-4 h-4 animate-bounce" />
                <span>{CONFIG.hero.buttonText}</span>
              </button>
            </motion.div>
          </div>

          {/* Нижний указатель скролла */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, delay: 2 }}
            className="flex flex-col items-center gap-1 cursor-pointer select-none"
            onClick={() => document.getElementById("timer-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            <span className="text-xs font-sans tracking-widest uppercase text-romantic-400 font-medium">Листай вниз</span>
            <ChevronDown className="w-4 h-4 text-romantic-400" />
          </motion.div>
        </section>


        {/* ======================== 
            ТАЙМЕР (Раздел 2)
           ======================== */}
        <section 
          id="timer-section"
          className="py-24 sm:py-32 flex flex-col items-center justify-center relative scroll-mt-6"
        >
          {/* Маленький декор */}
          <div className="absolute top-1/2 left-10 md:left-24 pointer-events-none opacity-30 animate-float-sticker">
            <Heart className="w-8 h-8 text-romantic-300 transform -rotate-12 fill-current" />
          </div>
          <div className="absolute top-1/3 right-10 md:right-24 pointer-events-none opacity-30 animate-twinkle">
            <Star className="w-6 h-6 text-pink-300 transform rotate-12 fill-current" />
          </div>

          <div className="text-center max-w-3xl mx-auto mb-14 px-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-romantic-400 block mb-2 font-sans font-medium">Бесценное время</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-stone-800 font-bold mb-4">
              {CONFIG.timer.title}
            </h2>
          </div>

          {/* Стеклянные карточки таймера */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl px-4">
            
            {/* ГОДЫ */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              className="col-span-2 lg:col-span-2 lg:col-start-2 bg-white/50 backdrop-blur-md border border-pink-100 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all group border border-white shadow-xl shadow-rose-100/40 mb-2"
            >
              <div className="p-3 bg-pink-100/40 rounded-full text-romantic-500 group-hover:text-romantic-600 group-hover:bg-pink-200/40 transition-colors mb-4">
                <Sparkles className="w-6 h-6 animate-spin-slow" />
              </div>
              <span className="text-3xl sm:text-4xl md:text-5xl font-serif text-romantic-600 font-bold tracking-tight mb-2">
                {timePassed.years}
              </span>
              <span className="text-xs sm:text-sm font-sans uppercase tracking-widest text-romantic-900/60 font-semibold group-hover:text-romantic-900 transition-colors">
                {timePassed.yearspan}
              </span>
            </motion.div>

            {/* Spacer to force row break in desktop grid */}
            <div className="hidden lg:block lg:col-span-4" />

            {/* ДНИ */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white/40 backdrop-blur-md border border-white/60 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all group border border-white shadow-xl shadow-rose-100/30"
            >
              <div className="p-3 bg-red-100/40 rounded-full text-romantic-500 group-hover:text-romantic-600 group-hover:bg-red-200/40 transition-colors mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl md:text-5xl font-serif text-romantic-600 font-bold tracking-tight mb-2">
                {timePassed.days}
              </span>
              <span className="text-xs sm:text-sm font-sans uppercase tracking-widest text-romantic-900/60 font-semibold group-hover:text-romantic-900 transition-colors">
                {timePassed.dayspan}
              </span>
            </motion.div>

            {/* ЧАСЫ */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white/40 backdrop-blur-md border border-white/60 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all group border border-white shadow-xl shadow-rose-100/30"
            >
              <div className="p-3 bg-orange-100/40 rounded-full text-amber-500 group-hover:text-amber-600 group-hover:bg-orange-200/40 transition-colors mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl md:text-5xl font-serif text-romantic-600 font-bold tracking-tight mb-2">
                {String(timePassed.hours).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm font-sans uppercase tracking-widest text-romantic-900/60 font-semibold group-hover:text-romantic-900 transition-colors">
                {timePassed.hourspan}
              </span>
            </motion.div>

            {/* МИНУТЫ */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white/40 backdrop-blur-md border border-white/60 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all group border border-white shadow-xl shadow-rose-100/30"
            >
              <div className="p-3 bg-rose-100/40 rounded-full text-rose-500 group-hover:text-rose-600 group-hover:bg-rose-200/40 transition-colors mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl md:text-5xl font-serif text-romantic-600 font-bold tracking-tight mb-2">
                {String(timePassed.minutes).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm font-sans uppercase tracking-widest text-romantic-900/60 font-semibold group-hover:text-romantic-900 transition-colors">
                {timePassed.minutespan}
              </span>
            </motion.div>

            {/* СЕКУНДЫ */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white/40 backdrop-blur-md border border-white/60 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all group border border-white shadow-xl shadow-rose-100/30"
            >
              <div className="p-3 bg-pink-100/40 rounded-full text-pink-500 group-hover:text-pink-600 group-hover:bg-pink-200/40 transition-colors mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl md:text-5xl font-serif text-romantic-600 font-bold tracking-tight mb-2">
                {String(timePassed.seconds).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm font-sans uppercase tracking-widest text-romantic-900/60 font-semibold group-hover:text-romantic-900 transition-colors">
                {timePassed.secondspan}
              </span>
            </motion.div>
          </div>
          <br></br>
          <div className="text-center max-w-3xl mx-auto mb-14 px-4">
          <p className="text-sm sm:text-base text-stone-500 leading-relaxed font-light font-sans">
              {CONFIG.timer.description}
            </p>
            </div>
        </section>


        {/* ======================== 
            ВОСПОМИНАНИЯ / LOVE STORY (Раздел 3)
           ======================== */}
        <section className="py-24 sm:py-32 relative">
          
          {/* Маленький декор в воспоминаниях */}
          <div className="absolute top-12 left-6 md:left-12 pointer-events-none opacity-25 animate-float-sticker">
            <MapPin className="w-7 h-7 text-romantic-400 transform rotate-12 fill-current" />
          </div>
          <div className="absolute top-1/2 right-4 md:right-10 pointer-events-none opacity-25 animate-twinkle">
            <Sparkles className="w-8 h-8 text-pink-300" />
          </div>
          <div className="absolute bottom-10 left-10 md:left-24 pointer-events-none opacity-25 animate-float-sticker" style={{ animationDelay: '2s' }}>
            <Heart className="w-6 h-6 text-rose-300 transform -rotate-12 fill-current" />
          </div>

          <div className="text-center max-w-2xl mx-auto mb-16 px-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-romantic-400 block mb-2 font-sans font-medium">Наша летопись</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-stone-800 font-bold mb-4">
              Моменты Счастья
            </h2>
            <p className="text-sm text-stone-500 font-sans leading-relaxed font-light">
              Наши тёплые воспоминания, незабываемые поездки и невероятные события. Нажми на любую карточку, чтобы посмотреть, как это все было...
            </p>
          </div>

          {/* Интерактивная лента в стиле Pinterest / Polaroid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 cursor-pointer">
            {CONFIG.memories.map((m, index) => {
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  style={{ transform: `rotate(${m.rotation}deg)` }}
                  onClick={(e) => {
                    triggerHeartExplosion(e.clientX, e.clientY);
                    setSelectedMemory(m);
                  }}
                  className="polaroid-card flex flex-col h-full"
                  id={`memory-card-${m.id}`}
                >
                  
                  {/* Контейнер рамки фотографии */}
                  <div className="relative aspect-3/4 overflow-hidden rounded-xs bg-stone-100 group">
                    <img 
                      src={m.imageUrls[0]} 
                      alt={m.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    />
                    
                    {/* Наложение при наведении */}
                    <div className="absolute inset-0 bg-gradient-to-t from-romantic-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="text-white text-xs font-sans tracking-widest uppercase bg-romantic-500/80 px-3.5 py-1.5 rounded-full shadow-md font-semibold backdrop-blur-xs flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Открыть воспоминание
                      </span>
                    </div>

                    {/* Название геолокации сверху */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-stone-950/45 text-white px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-wider backdrop-blur-xs font-semibold font-sans">
                      <MapPin className="w-3 h-3 text-pink-300" />
                      <span>{m.place}</span>
                    </div>
                  </div>

                  {/* Нижняя бумажная этикетка со шрифтом */}
                  <div className="mt-4 flex flex-col justify-between flex-grow">
                    <h3 className="text-xl sm:text-2xl font-serif text-stone-800 font-bold leading-tight">
                      {m.title}
                    </h3>
                    
                    <div className="flex items-center justify-between border-t border-stone-200/50 pt-2.5 mt-3.5">
                      <span className="text-stone-400 text-xs font-sans uppercase tracking-wider font-semibold">
                        {m.date}
                      </span>
                      <span className="text-romantic-300 group-hover:text-romantic-500 text-sm font-bold font-handwritten text-lg transition-colors">
                        with love 💕
                      </span>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </section>


        {/* ======================== 
            ИНТЕРАКТИВНЫЕ КНОПКИ (Раздел 4)
           ======================== */}
        <section className="py-24 sm:py-32 relative">
          
          {/* Маленький декор в интерактивных кнопках */}
          <div className="absolute top-10 right-8 md:right-16 pointer-events-none opacity-25 animate-float-sticker">
            <Gift className="w-7 h-7 text-pink-300 transform -rotate-12" />
          </div>
          <div className="absolute top-1/2 left-4 md:left-12 pointer-events-none opacity-20 animate-twinkle">
            <Sparkles className="w-8 h-8 text-romantic-400" />
          </div>
          <div className="absolute bottom-6 right-12 md:right-24 pointer-events-none opacity-25 animate-float-sticker" style={{ animationDelay: '3.5s' }}>
            <Heart className="w-6 h-6 text-rose-300 transform rotate-12 fill-current" />
          </div>

          <div className="text-center max-w-2xl mx-auto mb-12 px-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-romantic-400 block mb-2 font-sans font-medium">Интерактивный уголок</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-800 font-bold mb-4">
              Немножко милостей
            </h2>
            <p className="text-sm text-stone-500 font-sans leading-relaxed font-light">
              Понажимай на эти кнопочки, чтобы раскрыть маленькие секреты и вызвать волну приятных эмоций прямо сейчас.
            </p>
          </div>

          {/* Сетка интерактивных кнопок */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 max-w-5xl mx-auto">
            
            {/* КНОПКА 1. Нажми еще */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                triggerHeartExplosion(e.clientX, e.clientY);
                showRandomCompliment();
              }}
              className="p-7 rounded-[2rem] cursor-pointer text-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-pink-200/80 hover:shadow-xl hover:shadow-rose-100/40 transition-all flex flex-col justify-between items-center group relative overflow-hidden h-full min-h-[185px] shadow-sm"
              id="btn-compliments"
            >
              <div className="w-12 h-12 bg-pink-100/40 rounded-2xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform mb-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-base font-sans font-bold text-romantic-900/80 tracking-wide mb-2 block">
                {CONFIG.interactiveButtons.more.label}
              </h4>
              <p className="text-xs text-stone-500 leading-normal font-sans tracking-wide">
                Тысячи приятных слов и тёплых фраз
              </p>
            </motion.div>

            {/* КНОПКА 2. Секрет */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                triggerHeartExplosion(e.clientX, e.clientY);
                setShowSecret(true);
              }}
              className="p-7 rounded-[2rem] cursor-pointer text-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-pink-200/80 hover:shadow-xl hover:shadow-rose-100/40 transition-all flex flex-col justify-between items-center group relative overflow-hidden h-full min-h-[185px] shadow-sm"
              id="btn-secret"
            >
              <div className="w-12 h-12 bg-amber-100/40 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform mb-3">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="text-base font-sans font-bold text-romantic-900/80 tracking-wide mb-2 block">
                {CONFIG.interactiveButtons.secret.label}
              </h4>
              <p className="text-xs text-stone-500 leading-normal font-sans tracking-wide">
                Кое-что эксклюзивное, личное и очень душевное
              </p>
            </motion.div>

            {/* КНОПКА 3. Твое тепло */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                triggerHeartExplosion(e.clientX, e.clientY);
                setShowWarmth(true);
              }}
              className="p-7 rounded-[2rem] cursor-pointer text-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-pink-200/80 hover:shadow-xl hover:shadow-rose-100/40 transition-all flex flex-col justify-between items-center group relative overflow-hidden h-full min-h-[185px] shadow-sm"
              id="btn-warmth"
            >
              <div className="w-12 h-12 bg-rose-100/40 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform mb-3">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h4 className="text-base font-sans font-bold text-romantic-900/80 tracking-wide mb-2 block">
                {CONFIG.interactiveButtons.heart.label}
              </h4>
              <p className="text-xs text-stone-500 leading-normal font-sans tracking-wide">
                Кликни, чтобы виртуальный поцелуй и сердечки!
              </p>
            </motion.div>

            {/* КНОПКА 4. Еще кое-что */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                triggerHeartExplosion(e.clientX, e.clientY);
                setShowSomething(true);
              }}
              className="p-7 rounded-[2rem] cursor-pointer text-center bg-white/40 backdrop-blur-md border border-white/60 hover:border-pink-200/80 hover:shadow-xl hover:shadow-rose-100/40 transition-all flex flex-col justify-between items-center group relative overflow-hidden h-full min-h-[185px] shadow-sm"
              id="btn-something"
            >
              <div className="w-12 h-12 bg-red-100/40 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform mb-3">
                <Gift className="w-6 h-6" />
              </div>
              <h4 className="text-base font-sans font-bold text-romantic-900/80 tracking-wide mb-2 block">
                {CONFIG.interactiveButtons.something.label}
              </h4>
              <p className="text-xs text-stone-500 leading-normal font-sans tracking-wide">
                Финальный традиционный лонгридик для тебя Настюша
              </p>
            </motion.div>

          </div>

          {/* Отображение комплимента в реальном времени под кнопками */}
          <AnimatePresence>
            {activeCompliment && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-14 max-w-xl mx-auto px-4 text-center"
              >
                <div className="p-6 rounded-2xl bg-white border border-pink-100 shadow-md relative glow-pink">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-romantic-400 text-white rounded-full p-1.5 shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <p className="text-base sm:text-lg text-romantic-600 font-sans italic font-medium pt-2 leading-relaxed">
                    “{activeCompliment}”
                  </p>
                  <button 
                    onClick={() => setActiveCompliment(null)}
                    className="absolute top-2 right-2 text-stone-400 hover:text-stone-600 text-[10px] uppercase font-bold p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>


        {/* ======================== 
            ФИНАЛЬНЫЙ БЛОК (Раздел 5)
           ======================== */}
        <section className="py-24 sm:py-36 min-h-[90vh] flex flex-col justify-center items-center relative z-10 text-center px-4">
          
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            {/* Кружащие и светящиеся малые точки внутри финала */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/40 rounded-full blur-[70px]" />
            
            {/* Интенсивный поток сердечек по краям экрана в финале */}
            {Array.from({ length: ANIMATION_SETTINGS.footerHeartsLeftCount }).map((_, i) => {
              const size = Math.random() * 22 + 8;
              const delay = Math.random() * 6;
              const duration = Math.random() * 3.5 + 2.5; // быстрые: 2.5 - 6 сек
              const left = Math.random() * 15 + 1; // 1% - 16% от левого края
              return (
                <svg
                  key={`f-left-${i}`}
                  className="absolute bottom-4 text-pink-400/40 fill-current animate-footer-heart"
                  style={{
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              );
            })}
            {Array.from({ length: ANIMATION_SETTINGS.footerHeartsRightCount }).map((_, i) => {
              const size = Math.random() * 22 + 8;
              const delay = Math.random() * 6;
              const duration = Math.random() * 3.5 + 2.5; // быстрые: 2.5 - 6 сек
              const right = Math.random() * 15 + 1; // 1% - 16% от правого края
              return (
                <svg
                  key={`f-right-${i}`}
                  className="absolute bottom-4 text-pink-400/40 fill-current animate-footer-heart"
                  style={{
                    right: `${right}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              );
            })}
          </div>

          {/* Икона в финале */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: [0.9, 1.1, 1] }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-20 h-20 bg-linear-to-tr from-romantic-400 to-rose-400 rounded-full shadow-lg shadow-pink-200 flex items-center justify-center text-white mb-8 relative"
            onClick={(e) => triggerHeartExplosion(e.clientX, e.clientY)}
          >
            <Heart className="w-9 h-9 fill-current animate-pulse" />
            <span className="absolute inline-flex h-full w-full rounded-full bg-romantic-300 opacity-20 animate-ping" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-serif text-romantic-600 font-bold glow-text tracking-tight mb-6"
          >
            {CONFIG.footer.message}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-stone-500 font-sans max-w-xl text-base sm:text-lg font-light leading-relaxed mb-12"
          >
            {CONFIG.footer.subMessage}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="flex flex-col items-center gap-1 border-t border-romantic-200/50 pt-8 w-full max-w-xs"
          >
            <span className="text-lg font-handwritten text-romantic-500 text-2xl font-bold">
              {CONFIG.footer.signature}
            </span>
            <span className="text-[10px] uppercase font-sans tracking-widest text-stone-400 font-bold mt-1">
              Made specially for Nastya in 2026
            </span>
          </motion.div>

        </section>

      </div>


      {/* ========================================================
          ОКНА ДЕТАЛИЗАЦИИ / LIGHTBOXES (МОДАЛЬНЫЕ ОКНА)
         ======================================================== */}

      {/* 1. ПОДРОБНОСТИ ВОСПОМИНАНИЯ (Polaroid Lightbox) */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#fefdfa] rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl relative border border-white flex flex-col sm:flex-row gap-6"
            >
              {/* Кнопка закрытия */}
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 right-4 bg-stone-100/80 hover:bg-stone-200/80 text-stone-700 rounded-full p-2 transition-transform cursor-pointer hover:scale-110 active:scale-90 shadow-sm z-30"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Фото в лайтбоксе (Интерактивная карусель) */}
              <div className="w-full sm:w-1/2 aspect-3/4 rounded-2xl overflow-hidden shadow-md bg-stone-100 relative group/carousel">
                {selectedMemory.imageUrls && selectedMemory.imageUrls.length > 0 ? (
                  <>
                    <AnimatePresence mode="popLayout">
                      <motion.img 
                        key={activeImageIndex}
                        src={selectedMemory.imageUrls[activeImageIndex]} 
                        alt={`${selectedMemory.title} ${activeImageIndex + 1}`}
                        referrerPolicy="no-referrer"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>

                    {/* Навигационные кнопки-стрелочки */}
                    {selectedMemory.imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(prev => 
                              prev === 0 ? selectedMemory.imageUrls.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/75 backdrop-blur-md hover:bg-white text-stone-800 flex items-center justify-center shadow-md transition-all active:scale-90 hover:scale-105 cursor-pointer z-10"
                          title="Предыдущее фото"
                        >
                          <ChevronLeft className="w-4 h-4 text-stone-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(prev => 
                              prev === selectedMemory.imageUrls.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/75 backdrop-blur-md hover:bg-white text-stone-800 flex items-center justify-center shadow-md transition-all active:scale-90 hover:scale-105 cursor-pointer z-10"
                          title="Следующее фото"
                        >
                          <ChevronRight className="w-4 h-4 text-stone-700" />
                        </button>

                        {/* Индикаторы страниц (точки) */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/25 px-2.5 py-1 rounded-full backdrop-blur-xs">
                          {selectedMemory.imageUrls.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndex(idx);
                              }}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                idx === activeImageIndex 
                                  ? "bg-white scale-125 shadow-sm" 
                                  : "bg-white/55 hover:bg-white/80"
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Номер активного слайда */}
                        <div className="absolute top-3 right-3 bg-stone-900/40 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md font-sans">
                          {activeImageIndex + 1} / {selectedMemory.imageUrls.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                    Нет изображений
                  </div>
                )}
              </div>

              {/* Текст и описание в лайтбоксе */}
              <div className="w-full sm:w-1/2 flex flex-col justify-between py-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-romantic-500 uppercase tracking-wider font-semibold mb-2.5 font-sans">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedMemory.date}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif text-stone-800 font-bold leading-tight mb-4">
                    {selectedMemory.title}
                  </h3>

                  <p className="text-sm text-stone-600 leading-relaxed font-sans font-light">
                    {selectedMemory.description}
                  </p>
                </div>

                <div className="mt-6 sm:mt-0 border-t border-stone-100/80 pt-4 flex items-center justify-between">
                  <span className="text-[10px] tracking-widest uppercase font-sans text-stone-400 font-bold">
                    Память в сердце
                  </span>
                  <span className="font-handwritten text-romantic-500 text-xl font-bold flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current animate-pulse text-romantic-400" /> Навсегда вместе
                  </span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 2. СЕКРЕТ КНОПКА (Modal Popover) */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/35 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-panel-dark max-w-md w-full p-8 rounded-3xl text-center relative border border-white shadow-2xl"
            >
              <button
                onClick={() => setShowSecret(false)}
                className="absolute top-4 right-4 bg-white/70 hover:bg-white text-stone-700 rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-amber-400/20 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Star className="w-6 h-6 fill-current" />
              </div>

              <h3 className="text-xl sm:text-2xl font-serif text-stone-800 font-bold mb-3">
                {CONFIG.interactiveButtons.secret.label}
              </h3>

              <p className="text-sm text-stone-700 font-sans leading-relaxed font-light mb-6">
                {CONFIG.interactiveButtons.secret.message}
              </p>

              <button
                onClick={() => setShowSecret(false)}
                className="px-6 py-2.5 rounded-full bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs shadow-md shadow-amber-200/30 font-sans tracking-wider uppercase cursor-pointer transition-all"
              >
                Спасибо за тепло 💛
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 3. ТВОРЧЕСТВО СЕРДЕЧЕК (Тепло) */}
      <AnimatePresence>
        {showWarmth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-none"
            onAnimationComplete={() => {
              // Автозакрываем через 3 секунды
              const timer = setTimeout(() => {
                setShowWarmth(false);
              }, 5000);
              return () => clearTimeout(timer);
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.1, 1], rotate: [0, -5, 5, 0] }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-panel p-8 rounded-3xl max-w-xs text-center border border-white shadow-xl flex flex-col items-center justify-center"
            >
              <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
                <div className="w-14 h-14 bg-red-400 rounded-full animate-ping absolute" />
                <div className="w-14 h-14 bg-red-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-200 relative z-10">
                  <Heart className="w-8 h-8 fill-current" />
                </div>
              </div>

              <span className="text-lg font-serif text-stone-800 font-bold block mb-1">
                Импульс любви отправлен!
              </span>
              <p className="text-xs text-stone-500 font-sans font-light leading-relaxed">
                {CONFIG.interactiveButtons.heart.message}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 4. ЕЩЕ КОЕ-ЧТО (Letter Envelope / Письмо-Признание) */}
      <AnimatePresence>
        {showSomething && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-[#fcfbf7] max-w-lg w-full p-6 sm:p-10 rounded-3xl relative border border-[#e8dfc7] shadow-2xl flex flex-col items-center"
              style={{
                boxShadow: "inset 0 0 40px rgba(184, 150, 100, 0.08)"
              }}
            >
              {/* Почтовая марка наверху справа */}
              <div className="absolute top-6 right-6 w-12 h-14 border-2 border-dashed border-stone-300 rounded-sm p-1 flex items-center justify-center opacity-45 pointer-events-none">
                <Heart className="w-6 h-6 text-pink-400 fill-current" />
              </div>

              <button
                onClick={() => setShowSomething(false)}
                className="absolute top-4 left-4 bg-stone-200/60 hover:bg-stone-200 text-stone-700 rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-romantic-100 text-romantic-500 rounded-full flex items-center justify-center mb-6">
                <Gift className="w-6 h-6" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif text-stone-800 font-bold italic mb-5 glow-text">
                Любимой Настеньке 💌
              </h3>

              <div className="w-full text-stone-700 leading-relaxed font-sans text-sm font-light space-y-4 text-justify max-h-[350px] overflow-y-auto pr-2">
                <p>
                  Дорогая, любимая, самая красивая и лучшая на всем свете Настенька! Любовь моя! Солнце мое! Самый лучший и прекрасный человечек на всем белом свете! Поздравляю тебя с твоим праздником, с Днем рождения! Хочу пожелать тебе счастья, здоровья, больше любви и успехов во всех твоих начинаниях! Будь собой, будь со мной и будь счастлива!
                </p>
                <p>
                  Во всех воспоминаниях и здесь, и вообще ты остаешься самым прекрасным человечком в моей жизни! Будь то Соловки, Тула или далекий Шанхай, или просто мои проводы тебя до дома. Хочу также пожелать, чтобы тебя окружали хорошие друзья и знакомые, от которых ты можешь чему то научиться новому и полезному, которые поддержат тебя в трудную минуту и не оставят одну. 
                </p>
                <p>
                  <b>{CONFIG.interactiveButtons.something.message}</b>
                </p>
                <p className="text-right font-handwritten text-romantic-500 text-2xl pt-4 font-bold border-t border-stone-200/50">
                  Ваня Кот ❤️
                </p>
              </div>

              <button
                onClick={() => {
                  triggerHeartExplosion();
                  setShowSomething(false);
                }}
                className="mt-8 px-10 py-3 rounded-full bg-linear-to-r from-romantic-400 to-romantic-500 hover:from-romantic-500 hover:to-romantic-600 text-white font-medium text-xs font-sans tracking-widest uppercase shadow-md shadow-pink-200/50 cursor-pointer transition-all hover:scale-[1.03]"
              >
                Хранить в сердце 💕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
