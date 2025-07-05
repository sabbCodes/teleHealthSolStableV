// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { WalletSetup } from "../../components/wallet-setup";
// import { useToast } from "@/components/ui/use-toast";

// export default function WalletSetupPage() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const searchParams = useSearchParams();

//   const userToken = searchParams.get("userToken") || "";
//   const appId = searchParams.get("appId") || "";

//   if (!userToken || !appId) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         Missing wallet setup parameters.
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 min-h-screen">
//       <div className="flex justify-end mb-6">
//         <Link href="/">
//           <Button variant="outline">Back to Home</Button>
//         </Link>
//       </div>
//       <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
//         <h1 className="text-2xl font-bold mb-6">Set Up Your Wallet</h1>
//         <WalletSetup
//           userToken={userToken}
//           appId={appId}
//           onComplete={() => router.push("/account-type-selection")}
//           onError={(err: Error) =>
//             toast({
//               variant: "destructive",
//               title: "Error initializing wallet",
//               description:
//                 err?.message || "Wallet setup failed. Please try again.",
//             })
//           }
//         />
//       </div>
//     </div>
//   );
// }
