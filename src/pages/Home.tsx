import {Footer} from "../components/Footer"
import {Hero} from "../components/home/Hero"
import Stats from "../components/home/Stats"
import Navbar from "../components/Navbar"

export const Home = () => {
    return (
      <div>
        <Navbar />
        <Hero />
        <Stats />
        <Footer />
      </div>
    )
}
