import { Button } from "./ui/button"
import getUserBalance from "@/app/actions/getUserBalance"

const Balance = async () => {
  const { coins } = await getUserBalance()

  return (
    <Button variant='outline'>{ coins } 🪙</Button>
  )
}
export default Balance