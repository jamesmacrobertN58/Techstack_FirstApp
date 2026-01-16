import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#16161d] border border-[#2a2a35]",
          }
        }}
      />
    </div>
  )
}