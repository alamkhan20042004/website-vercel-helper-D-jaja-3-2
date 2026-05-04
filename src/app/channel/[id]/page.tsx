import { getServerUrlById } from "@/lib/data";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Database se direct link nikalein (Proxy ki zaroorat nahi)
  const serverUrl = await getServerUrlById(id);
  const streamUrl = serverUrl || `https://example.com/stream/${id}`;
  const title = `Sports Player - ${id}`;

  return (
    <div className="w-screen h-screen overflow-hidden bg-black m-0 p-0 fixed inset-0">
      <iframe
        title={title}
        marginHeight={0}
        marginWidth={0}
        scrolling="no"
        src={streamUrl} // Direct URL lagayen (e.g. https://embedsports.top/...)
        referrerPolicy="no-referrer" // YEH WOH TRICK HAI JO BLOCK HONE SE BACHAYEGI
        allow="encrypted-media; picture-in-picture;"
        allowFullScreen
        width="100%"
        height="100%"
        frameBorder="0"
        className="w-full h-full border-none block m-0 p-0 bg-black"
      />
    </div>
  );
}




















// import { getServerUrlById } from "@/lib/data";

// export default async function ChannelPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   const serverUrl = await getServerUrlById(id);
//   const streamUrl = serverUrl || `https://example.com/stream/${id}`;
//   const title = `Sports Player - ${id}`;

//   return (
//     <div className="w-screen h-screen overflow-hidden bg-black m-0 p-0 fixed inset-0">
//       <iframe
//         title={title}
//         marginHeight={0}
//         marginWidth={0}
//         scrolling="no"
//         src={streamUrl}
//         allow="encrypted-media; picture-in-picture;"
//         allowFullScreen
//         width="100%"
//         height="100%"
//         frameBorder="0"
//         className="w-full h-full border-none block m-0 p-0 bg-black"
//       />
//     </div>
//   );
// }
