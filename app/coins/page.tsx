import CoinOptions from "@/components/CoinOptions"
import Header from "@/components/Header"

const page = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CoinOptions />
    </div>
  )
}
export default page