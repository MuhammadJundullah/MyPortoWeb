import NavMenu from "./_components/NavMenu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="sm:mx-10 mx-5 py-5">
      <div className="mx-auto sm:px-4 max-w-6xl">
        <div className="flex items-end">
          <NavMenu />
        </div>
        <div className="border-b border-gray-300 lg:w-full sm:block md:block lg:block hidden mt-5" />
      </div>
      {children}
    </main>
  );
}
