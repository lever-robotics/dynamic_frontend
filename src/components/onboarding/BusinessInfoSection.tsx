// "use client";
// import * as React from "react";
// import { LogoUpload } from "./LogoUpload";

// interface BusinessInfoSectionProps {
//   businessName: string;
//   setBusinessName: (name: string) => void;
//   logoUrl: string;
//   setLogoUrl: (url: string) => void;
//   isHovering: string | null;
//   setIsHovering: (value: string | null) => void;
// }

// export const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({
//   businessName,
//   setBusinessName,
//   logoUrl,
//   setLogoUrl,
//   isHovering,
//   setIsHovering,
// }) => {
//   return (
//     <div className="flex flex-col gap-4">
//       <div className="flex flex-col gap-2">
//         <label
//           htmlFor="businessName"
//           className="text-sm font-medium text-zinc-800"
//         >
//           Business Name
//         </label>
//         <input
//           type="text"
//           id="businessName"
//           placeholder="Enter your business name"
//           className="px-4 py-3 w-full text-base rounded-lg border"
//           value={businessName}
//           onChange={(event) => setBusinessName(event.target.value)}
//         />
//       </div>
//       <LogoUpload
//         logoUrl={logoUrl}
//         setLogoUrl={setLogoUrl}
//         isHovering={isHovering}
//         setIsHovering={setIsHovering}
//       />
//     </div>
//   );
// };
