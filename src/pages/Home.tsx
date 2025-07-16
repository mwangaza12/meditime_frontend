import { motion, type Variants } from "framer-motion"
import { Footer } from "../components/Footer"
import { Content } from "../components/home/Content"
import { DoctorsSection } from "../components/home/DoctorsSection"
import Faq from "../components/home/Faq"
import { Hero } from "../components/home/Hero"
import { Specialization } from "../components/home/Specialization"
import { Stats } from "../components/home/Stats"
import Navbar from "../components/Navbar"

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
}

export const Home = () => {
  return (
    <div>
      <Navbar />

      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Hero />
      </motion.section>

      <motion.section
        className="bg-blue-50"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Specialization />
      </motion.section>

      <motion.section
        className="bg-white"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Content />
      </motion.section>

      <motion.section
        className="bg-blue-50"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <DoctorsSection />
      </motion.section>

      <motion.section
        className="bg-white"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Stats />
      </motion.section>

      <motion.section
        className="bg-blue-50"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Faq />
      </motion.section>

      <Footer />
    </div>
  )
}
