// import * as React from "react";
//
// export default function MyComponent() {
//   return (
//     <div className="flex flex-col pb-7 bg-white rounded-md border border-gray-100 border-solid max-w-[796px]">
//       <img
//         loading="lazy"
//         srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/217b4c96af711979d53ec8486d5944f98ab8451d88f9033e4d9715585fb96dbf?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/217b4c96af711979d53ec8486d5944f98ab8451d88f9033e4d9715585fb96dbf?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/217b4c96af711979d53ec8486d5944f98ab8451d88f9033e4d9715585fb96dbf?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/217b4c96af711979d53ec8486d5944f98ab8451d88f9033e4d9715585fb96dbf?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/217b4c96af711979d53ec8486d5944f98ab8451d88f9033e4d9715585fb96dbf?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/217b4c96af711979d53ec8486d5944f98ab8451d88f9033e4d9715585fb96dbf?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/217b4c96af711979d53ec8486d5944f98ab8451d88f9033e4d9715585fb96dbf?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/217b4c96af711979d53ec8486d5944f98ab8451d88f9033e4d9715585fb96dbf?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//         className="w-full aspect-[5.26] max-md:max-w-full"
//       />
//       <div className="flex z-10 flex-col px-7 -mt-12 w-full max-md:px-5 max-md:max-w-full">
//         <img
//           loading="lazy"
//           src="https://cdn.builder.io/api/v1/image/assets/TEMP/66b20843240b9529ea9bc7ba66af38c00fee959822fbd82ca1fc172f3c02d2b6?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//           className="w-24 shadow-sm aspect-square"
//         />
//         <div className="flex gap-5 justify-between mt-6 w-full max-md:flex-wrap max-md:max-w-full">
//           <div className="flex flex-col">
//             <div className="text-2xl font-bold leading-9 text-zinc-900">
//               Product name
//             </div>
//             <div className="mt-5 text-base leading-7 text-zinc-700">
//               Location
//             </div>
//           </div>
//           <div className="flex gap-5 my-auto">
//             <img
//               loading="lazy"
//               src="https://cdn.builder.io/api/v1/image/assets/TEMP/a9163ada473b65529595de2f34376e8e75e4d6046d802239869cd96de1aa5b10?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//               className="shrink-0 w-6 aspect-square"
//             />
//             <img
//               loading="lazy"
//               src="https://cdn.builder.io/api/v1/image/assets/TEMP/fcded3d81ceea451ab4bf3ec89783d1ae74811bdd6fa9713187348a4f2eccc97?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//               className="shrink-0 w-6 aspect-square"
//             />
//           </div>
//         </div>
//         <div className="flex gap-4 items-center self-start px-5 py-3 mt-10 text-xs leading-5 bg-white rounded-md border border-gray-100 border-solid max-md:flex-wrap">
//           <div className="flex flex-col self-stretch my-auto">
//             <div className="text-zinc-400">Description 1</div>
//             <div className="mt-2.5 font-medium text-zinc-900">
//               Ut dolore qui cul
//             </div>
//           </div>
//           <img
//             loading="lazy"
//             src="https://cdn.builder.io/api/v1/image/assets/TEMP/8507e9660d844fadb909fc916b936f38263542442f841a3747375697f4308729?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//             className="shrink-0 self-stretch w-px border border-gray-100 border-solid aspect-[0.03] stroke-[1px] stroke-gray-100"
//           />
//           <div className="flex flex-col self-stretch my-auto">
//             <div className="text-zinc-400">Description 2</div>
//             <div className="mt-2.5 font-medium text-zinc-900">Quis nostru</div>
//           </div>
//           <img
//             loading="lazy"
//             src="https://cdn.builder.io/api/v1/image/assets/TEMP/8507e9660d844fadb909fc916b936f38263542442f841a3747375697f4308729?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//             className="shrink-0 self-stretch w-px border border-gray-100 border-solid aspect-[0.03] stroke-[1px] stroke-gray-100"
//           />
//           <div className="flex flex-col self-stretch my-auto">
//             <div className="text-zinc-400">Description 3</div>
//             <div className="mt-2.5 font-medium text-zinc-900">Amet irure</div>
//           </div>
//           <img
//             loading="lazy"
//             src="https://cdn.builder.io/api/v1/image/assets/TEMP/8507e9660d844fadb909fc916b936f38263542442f841a3747375697f4308729?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//             className="shrink-0 self-stretch w-px border border-gray-100 border-solid aspect-[0.03] stroke-[1px] stroke-gray-100"
//           />
//           <div className="flex flex-col self-stretch my-auto">
//             <div className="text-zinc-400">Description 4</div>
//             <div className="mt-2.5 font-medium text-zinc-900">
//               Do culpa quis ullamc
//             </div>
//           </div>
//         </div>
//         <div className="mt-9 text-lg font-bold leading-7 text-zinc-900 max-md:max-w-full">
//           Overview
//         </div>
//         <div className="mt-7 text-sm leading-6 text-zinc-900 max-md:max-w-full">
//           Fugiat nostrud in reprehenderit minim voluptate enim laborum nisi
//           eiusmod Lorem ea culpa quis reprehenderit ut anim irure. Dolore
//           laborum enim esse officia Lorem irure veniam. Mollit dolor do
//           voluptate amet ut mollit irure Lorem tempor in ullamco qui ea ex.
//           Dolore proident aute ullamco laboris am
//         </div>
//         <div className="mt-10 text-lg font-bold leading-7 text-zinc-900 max-md:max-w-full">
//           Detail description
//         </div>
//         <div className="flex gap-2 mt-4 text-sm leading-6 text-zinc-900 max-md:flex-wrap">
//           <img
//             loading="lazy"
//             src="https://cdn.builder.io/api/v1/image/assets/TEMP/9c56e4ae9c6ffda4b7a0a01f4a42d7d852aa4c4b7ddca68d44a7af0f863a744c?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//             className="shrink-0 self-start w-6 aspect-square"
//           />
//           <div className="flex-auto max-md:max-w-full">
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//             eiusmod tempor incididunt ut labore et dolore magna aliqua.{" "}
//           </div>
//         </div>
//         <div className="flex gap-2 mt-5 text-sm leading-none text-zinc-900 max-md:flex-wrap">
//           <img
//             loading="lazy"
//             src="https://cdn.builder.io/api/v1/image/assets/TEMP/d6cb4bf01a36a6968b7f34ed2847acc005c35143729b1f884da419a98793d8df?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//             className="shrink-0 w-6 aspect-square"
//           />
//           <div className="flex-auto my-auto max-md:max-w-full">
//             Voluptate nisi commodo sunt sint do officia quis{" "}
//             <span className="leading-none">ull</span>amco sunt minim t
//             <span className="leading-none">
//               empor ea eu consequat sit eu ullamco nisi.
//             </span>
//           </div>
//         </div>
//         <div className="flex gap-2 mt-9 text-sm leading-none text-zinc-900 max-md:flex-wrap">
//           <img
//             loading="lazy"
//             src="https://cdn.builder.io/api/v1/image/assets/TEMP/9c56e4ae9c6ffda4b7a0a01f4a42d7d852aa4c4b7ddca68d44a7af0f863a744c?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//             className="shrink-0 w-6 aspect-square"
//           />
//           <div className="flex-auto my-auto max-md:max-w-full">
//             Minim aute enim ipsum duis ut reprehenderit aliquip ea deserunt sint
//             quis sit sint. Cillum et adipi
//             <span className="leading-none">s</span>icing
//             <span className="leading-none">.</span>
//           </div>
//         </div>
//         <div className="flex gap-2 mt-4 text-sm leading-none text-zinc-900 max-md:flex-wrap">
//           <img
//             loading="lazy"
//             src="https://cdn.builder.io/api/v1/image/assets/TEMP/9c56e4ae9c6ffda4b7a0a01f4a42d7d852aa4c4b7ddca68d44a7af0f863a744c?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//             className="shrink-0 w-6 aspect-square"
//           />
//           <div className="flex-auto my-auto max-md:max-w-full">
//             Tempor proident veniam esse quis laboris esse eu magna. Occaecat
//             officia enim <span className="leading-none">c</span>ulpa
//             <span className="leading-none">.</span>
//           </div>
//         </div>
//         <div className="flex gap-2 mt-4 text-sm leading-6 text-zinc-900 max-md:flex-wrap">
//           <img
//             loading="lazy"
//             src="https://cdn.builder.io/api/v1/image/assets/TEMP/9c56e4ae9c6ffda4b7a0a01f4a42d7d852aa4c4b7ddca68d44a7af0f863a744c?apiKey=a06b80e5fe04433381b2d8ff9da77bb4&"
//             className="shrink-0 self-start w-6 aspect-square"
//           />
//           <div className="flex-auto max-md:max-w-full">
//             Cillum nostrud anim magna excepteur esse aliquip laboris laboru
//             <span className="leading-none">
//               m labore id aute consequat eiusmod. Dolor quis quis non nostrud
//               nostrud offi
//             </span>
//             ci<span className="leading-none">a </span>do
//             <span className="leading-none">.</span>
//           </div>
//         </div>
//         <div className="flex gap-4 self-start mt-9 text-base leading-7 whitespace-nowrap">
//           <div className="justify-center px-12 py-4 text-gray-600 bg-gray-100 rounded-md max-md:px-5">
//             Contact
//           </div>
//           <div className="justify-center px-14 py-4 text-white bg-cyan-500 rounded-md max-md:px-5">
//             Select
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
//
//
//
