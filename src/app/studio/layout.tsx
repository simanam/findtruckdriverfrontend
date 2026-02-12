export const metadata = {
  title: 'Studio | FindTruckDriver',
  description: 'Content management studio',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="!bg-white !text-black" style={{ height: '100vh' }}>
      {children}
    </div>
  )
}
