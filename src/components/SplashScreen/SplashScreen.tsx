import { motion, type Variants } from 'framer-motion'
import styles from './SplashScreen.module.css'

type SplashScreenProps = {
  onComplete: () => void
}

const logoPieceVariants: Variants = {
  hidden: (index: number) => ({
    opacity: 0,
    x: index % 2 === 0 ? -140 : 140,
    y: index < 2 ? -80 : 80,
    rotate: index % 2 === 0 ? -18 : 18,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 220,
      damping: 20,
    },
  },
}

const textContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.85,
    },
  },
}

const textItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0, 0, 0.2, 1] },
  },
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const pieceClasses = [
    styles.piece1,
    styles.piece2,
    styles.piece3,
    styles.piece4,
  ]

  return (
    <motion.section
      className={styles.splash}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
    >
      <motion.div
        className={styles.centerBlock}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0, 0, 0.2, 1] }}
      >
        <div className={styles.logo} aria-label="VietinBank logo">
          {[0, 1, 2, 3].map((piece) => (
            <motion.div
              key={piece}
              className={`${styles.logoPiece} ${pieceClasses[piece]}`}
              custom={piece}
              variants={logoPieceVariants}
              initial="hidden"
              animate="visible"
            />
          ))}
        </div>

        <motion.h1
          className={styles.brand}
          variants={textContainer}
          initial="hidden"
          animate="visible"
          aria-label="11SoVang_KCYD"
        >
          {'11SoVang_KCYD'.split('').map((char, index) => (
            <motion.span key={`${char}-${index}`} variants={textItem}>
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>
      </motion.div>

      <motion.button
        className={styles.skip}
        whileTap={{ scale: 0.97 }}
        onClick={onComplete}
      >
        Bỏ qua
      </motion.button>
    </motion.section>
  )
}
