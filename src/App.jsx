import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Music, VolumeX, Gift, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import './index.css';

const playMagicalChimes = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { 
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3 / (i + 1), audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5 + (i * 0.2));
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(audioCtx.currentTime + (i * 0.1));
      osc.stop(audioCtx.currentTime + 2.5);
    });
  } catch (e) {
    console.log("AudioContext not supported", e);
  }
};

const fallingConfig = [
  { x: '30vw', delay: 2, duration: 18 },
  { x: '50vw', delay: 8, duration: 22 },
  { x: '70vw', delay: 0, duration: 20 },
  { x: '40vw', delay: 14, duration: 25 },
  { x: '60vw', delay: 6, duration: 19 },
  { x: '55vw', delay: 12, duration: 24 },
];

const FallingElements = () => {
  const emojis = ['🌺', '🌸', '🌼', '🍃', '🌺', '🌸'];

  return (
    <div className="falling-elements-container">
      {emojis.map((emoji, i) => (
        <motion.div 
          key={i}
          className="falling-emoji"
          initial={{ y: '-20vh', x: fallingConfig[i].x, rotate: 0 }}
          animate={{
            y: '120vh',
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: fallingConfig[i].duration,
            repeat: Infinity,
            delay: fallingConfig[i].delay,
            ease: "linear"
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

const WelcomeScreen = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [seaAudio] = useState(new Audio('/sea-sound.mp3'));

  useEffect(() => {
    seaAudio.loop = true;
    seaAudio.volume = 0.5;

    const tryPlay = () => {
      seaAudio.play().catch(e => console.log("Esperando interacción para audio..."));
    };
    
    tryPlay();

    const onInteract = () => {
      tryPlay();
      document.removeEventListener('click', onInteract);
      document.removeEventListener('touchstart', onInteract);
    };
    
    document.addEventListener('click', onInteract);
    document.addEventListener('touchstart', onInteract);

    return () => {
      seaAudio.pause();
      document.removeEventListener('click', onInteract);
      document.removeEventListener('touchstart', onInteract);
    };
  }, [seaAudio]);

  const handleClick = () => {
    if (isOpen) return;
    setIsOpen(true);
    
    // Detener mar y reproducir campanas mágicas
    seaAudio.pause();
    playMagicalChimes();
    
    // Confetti explosion
    setTimeout(() => {
      const duration = 2500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 15,
          angle: 90,
          spread: 80,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#ff6b6b', '#ffb6c1', '#1dd1a1', '#ff9eb3', '#ff9ff3'],
          startVelocity: 45
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }, 400);

    // Trigger main app open
    setTimeout(() => {
      onOpen();
    }, 2200);
  };

  return (
    <motion.div 
      className="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -100, filter: 'blur(10px)', transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="welcome-content">
        <motion.h3 
          className="welcome-text"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ¡Acabas de recibir una<br/>invitación muy especial!
        </motion.h3>

        <div className="envelope-container" onClick={handleClick}>
          <motion.div 
            className="envelope-wrapper"
            animate={!isOpen ? {
              rotate: [0, -3, 4, -4, 3, 0],
              y: [0, -5, 5, -5, 0]
            } : {}}
            transition={!isOpen ? {
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2
            } : {}}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <svg viewBox="0 0 300 200" width="320" height="220" style={{ overflow: 'visible', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.4))' }}>
              <defs>
                <linearGradient id="shell-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffb38a" />
                  <stop offset="100%" stopColor="#ff7f50" />
                </linearGradient>
                <linearGradient id="shell-flap" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffe4b5" />
                  <stop offset="100%" stopColor="#ff9966" />
                </linearGradient>
              </defs>

              {/* Back of envelope */}
              <rect x="0" y="0" width="300" height="200" fill="url(#shell-grad)" rx="15" />
              
              {/* Letter inside */}
              <motion.g
                initial={{ y: 0 }}
                animate={{ y: isOpen ? -100 : 0 }}
                transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
              >
                <rect x="15" y="15" width="270" height="170" fill="#fff" rx="8" />
              </motion.g>

              {/* Front Pocket - Curved like the bottom of a shell */}
              <path d="M 0 0 L 0 200 L 300 200 L 300 0 C 250 80, 200 120, 150 120 C 100 120, 50 80, 0 0 Z" fill="url(#shell-grad)" />
              <path d="M 0 0 C 50 80, 100 120, 150 120 C 200 120, 250 80, 300 0" fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" />
              
              {/* Flap - Scallop Seashell Design */}
              <motion.g
                style={{ transformOrigin: 'top' }}
                initial={{ scaleY: 1, opacity: 1 }}
                animate={{ scaleY: isOpen ? -1 : 1, opacity: isOpen ? 0 : 1 }}
                transition={{ duration: 0.4 }}
              >
                <path d="M 0 0 C 50 40, 90 145, 150 145 C 210 145, 250 40, 300 0 Z" fill="url(#shell-flap)" />
                {/* Seashell ridges */}
                <path d="M 150 0 L 150 145" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                <path d="M 125 0 L 132 140" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                <path d="M 100 0 L 112 130" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                <path d="M 75 0 L 92 110" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                <path d="M 50 0 L 70 85" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                <path d="M 25 0 L 45 50" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                
                <path d="M 175 0 L 168 140" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                <path d="M 200 0 L 188 130" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                <path d="M 225 0 L 208 110" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                <path d="M 250 0 L 230 85" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                <path d="M 275 0 L 255 50" stroke="#ff7f50" strokeWidth="3" opacity="0.6" />
                
                {/* Edge highlight */}
                <path d="M 0 0 C 50 40, 90 145, 150 145 C 210 145, 250 40, 300 0" fill="none" stroke="#fff" strokeWidth="3" opacity="0.7" />
              </motion.g>
            </svg>
          </motion.div>
        </div>

        <motion.div 
          className="click-hint"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          ¡Toca el sobre para abrir la invitación!
        </motion.div>

        <div className="bottom-characters" style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '2rem', alignItems: 'flex-end' }}>
          <motion.img 
            animate={{ y: [0, -10, 0] }} transition={{ duration: 2.2, repeat: Infinity }}
            src="/sin-fondo/588212401344592705-removebg-preview.png" style={{ height: '110px', objectFit: 'contain', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))' }} alt="Animal 1" 
          />
          <motion.img 
            animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            src="/sin-fondo/Cute_Turtle_Sticker-removebg-preview.png" style={{ height: '110px', objectFit: 'contain', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))' }} alt="Animal 2" 
          />
        </div>
      </div>
    </motion.div>
  );
};
const Countdown = ({ targetDate, title }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="countdown-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1.5rem 0' }}>
      {title && <h4 style={{ color: '#ff4757', marginBottom: '10px', fontSize: '1.1rem', textAlign: 'center' }}>{title}</h4>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {[
          { label: 'Días', value: timeLeft.days },
          { label: 'Hrs', value: timeLeft.hours },
          { label: 'Min', value: timeLeft.minutes },
          { label: 'Seg', value: timeLeft.seconds }
        ].map((item, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 255, 255, 0.7)', padding: '10px', borderRadius: '12px', minWidth: '65px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.5)' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ff7f50', textShadow: '1px 1px 0px rgba(255,255,255,0.8)' }}>{item.value}</span>
            <span style={{ fontSize: '0.8rem', color: '#008080', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [photoFlip, setPhotoFlip] = useState(0);
  const [canConfirm, setCanConfirm] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    const confirmationLimit = new Date("2026-10-12T23:59:59");
    setCanConfirm(new Date() <= confirmationLimit);
    const interval = setInterval(() => {
      setCanConfirm(new Date() <= confirmationLimit);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpened) {
      const interval = setInterval(() => {
        setPhotoFlip(prev => prev + 1);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpened]);

  const handleVideoEnded = () => {
    setShowVideo(false);
    setTimeout(() => {
      setShowVideo(true);
    }, 20000);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleOpen = () => {
    setIsOpened(true);
    setIsPlaying(true);
  };

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const sequenceVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: (custom) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        delay: custom * 1.2,
        duration: 0.8,
        type: 'spring',
        bounce: 0.4
      }
    })
  };

  return (
    <div className="app-container">
      <audio ref={audioRef} src="/music.m4a" loop />
      <div className="background">
        <div className="background-overlay"></div>
      </div>
      
      {isOpened && showVideo && (
        <video 
          className="background-video" 
          src="/bg-video.mp4" 
          autoPlay 
          muted 
          playsInline
          onEnded={handleVideoEnded}
        />
      )}

      <FallingElements />

      <AnimatePresence>
        {!isOpened ? (
          <WelcomeScreen key="welcome" onOpen={handleOpen} />
        ) : (
          <motion.div 
            className="content"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: 'spring' }}
          >
            <div className="sequence-container">
              
              <motion.div 
                className="invitation-header"
                custom={0.2}
                initial="hidden"
                animate="visible"
                variants={sequenceVariants}
              >
                <h2 className="hero-subtitle" style={{ 
                  fontSize: '2.5rem', 
                  color: '#ff4757', 
                  textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 4px 8px rgba(0,0,0,0.5)', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {"¡Te invito a mi cumpleaños!".split(" ").map((word, wordIndex, array) => (
                    <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                      {word.split("").map((char, index) => (
                        <motion.span
                          key={index}
                          animate={{ y: [0, -10, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: (wordIndex * 5 + index) * 0.05,
                            ease: "easeInOut"
                          }}
                          style={{ display: 'inline-block' }}
                        >
                          {char}
                        </motion.span>
                      ))}
                      {wordIndex < array.length - 1 && <span style={{ display: 'inline-block', width: '0.3em' }}>&nbsp;</span>}
                    </span>
                  ))}
                </h2>
              </motion.div>

              <motion.div 
                className="photo-container"
                custom={1.5}
                initial="hidden"
                animate="visible"
                variants={sequenceVariants}
                whileHover={{ scale: 1.05 }}
                style={{ position: 'relative', display: 'flex', justifyContent: 'center', cursor: 'pointer', perspective: '1000px' }}
                onClick={() => setPhotoFlip(prev => prev + 1)}
              >
                <motion.div 
                  className="photo-wrapper"
                  animate={{ rotateY: photoFlip * 360 }}
                  transition={{ duration: 1.5, type: 'spring', bounce: 0.3 }}
                >
                  <div className="photo-inner-circle">
                    <img src="/moana-character.png" alt="Ailany Marina" className="photo-image-full" />
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                custom={1.8}
                initial="hidden"
                animate="visible"
                variants={sequenceVariants}
                style={{ display: 'flex', justifyContent: 'center', marginTop: '-2rem', marginBottom: '-1rem', position: 'relative', zIndex: 10 }}
              >
                <motion.img 
                  animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  src="/nuevo-elemento.png" 
                  alt="1 Año" 
                  style={{ width: '160px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))' }} 
                />
              </motion.div>
          </div>



          <motion.div 
            className="glass-card"
              custom={2.2}
              initial="hidden"
              animate="visible"
              variants={sequenceVariants}
              whileHover={{ y: -5 }}
              style={{ marginTop: '0' }}
            >
              <img src="/sin-fondo/1098245059161126886-removebg-preview.png" style={{ position: 'absolute', top: '-40px', left: '-20px', width: '100px', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))' }} alt="Decoration" />
              <img src="/sin-fondo/descarga__1_-removebg-preview.png" style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))' }} alt="Decoration" />
              
              <h3 className="section-title">¿Dónde y Cuándo?</h3>

              <div className="info-item">
                <Calendar className="info-icon" size={32} />
                <span className="info-text">Sábado, 17 de Octubre</span>
              </div>
              
              <div className="info-item">
                <Clock className="info-icon" size={32} />
                <span className="info-text">15:30 hrs</span>
              </div>

              <Countdown targetDate="2026-10-17T15:30:00" title="Tiempo restante para el cumpleaños:" />

              <div className="info-item">
                <MapPin className="info-icon" size={32} />
                <div className="info-text">
                  <strong>Lugar de la Aventura</strong><br/>
                  <span style={{fontSize: '1.1rem'}}>Cancha de carreras, los Copihues, Tanilvoro</span>
                </div>
              </div>
              
              <motion.a 
                href="https://maps.app.goo.gl/oK25rLC6eyzCLuGE8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="action-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver en Mapa
              </motion.a>
            </motion.div>

            <motion.div
              custom={2.5}
              initial="hidden"
              animate="visible"
              variants={sequenceVariants}
              style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0', position: 'relative', zIndex: 10, cursor: 'pointer', perspective: '1000px' }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setPhotoFlip(prev => prev + 1)}
            >
              <motion.img 
                animate={{ rotateY: photoFlip * 360 }}
                transition={{ duration: 1.5, type: 'spring', bounce: 0.3 }}
                src="/foto-centro.jpg" 
                alt="Ailany Marina" 
                style={{ width: '90%', maxWidth: '350px', borderRadius: '15px', border: '5px solid #fff', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }} 
              />
            </motion.div>

            <motion.div 
              className="glass-card"
              custom={2.8}
              initial="hidden"
              animate="visible"
              variants={sequenceVariants}
              whileHover={{ y: -5 }}
            >
              <img src="/sin-fondo/Cute_Turtle_Sticker-removebg-preview.png" style={{ position: 'absolute', top: '-30px', right: '-10px', width: '90px', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))' }} alt="Turtle" />
              <img src="/sin-fondo/descarga__2_-removebg-preview.png" style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '100px', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))' }} alt="Decoration" />

              <h3 className="section-title" style={{ color: '#008080' }}>Detalles Importantes</h3>

              <div className="info-item">
                <Gift className="info-icon" size={32} />
                <span className="info-text">El mejor regalo es tu presencia. (Ropa cómoda)</span>
              </div>

              <div className="info-item" style={{marginTop: '2rem'}}>
                <CheckCircle className="info-icon" size={32} />
                <span className="info-text">Por favor confirma tu asistencia antes del lunes 12 de Octubre.</span>
              </div>

              {canConfirm && (
                <Countdown targetDate="2026-10-12T23:59:59" title="Tiempo restante para confirmar:" />
              )}

              {canConfirm ? (
                <motion.a 
                  href="https://wa.me/56932646769" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button whatsapp-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Confirmar por WhatsApp
                </motion.a>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '1rem', color: '#ff4757', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  El plazo para confirmar asistencia ha finalizado.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpened && (
          <motion.div 
            className={`music-control ${isPlaying ? 'playing' : ''}`} 
            onClick={toggleMusic}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 2, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
          >
            {isPlaying ? <Music size={32} /> : <VolumeX size={32} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
