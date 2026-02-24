import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="text-lg mb-6">
          Go to the{" "}
          <Link href="/project" className="text-blue-500 hover:underline font-semibold">
            online editor
          </Link>
        </p>
      </div>
    </div>
  );
}