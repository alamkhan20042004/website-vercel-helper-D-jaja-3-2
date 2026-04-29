export default async function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Map channel IDs to their respective iframe URLs
  let streamUrl = "";
  let title = "Sports Player";

  if (id === "willow-sports") {
    streamUrl = "https://embedsports.top/embed/admin/admin-willow-cricket/2";
    title = "Willow Cricket Player";
  } else {
    streamUrl = `https://example.com/stream/${id}`;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-black m-0 p-0 fixed inset-0">
      <iframe
        title={title}
        marginHeight={0}
        marginWidth={0}
        scrolling="no"
        src={streamUrl}
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

