
import Image from "next/image";

export default function Home() {

  const team = [
    {
      name: "Tay",
      image: "tay.png",
      role: "Developer"
    },
    {
      name: "Oli",
      image: "oli.png",
      role: "Donated a singular Cent"
    },
    {
      name: "Don",
      image: "don.png",
      role: "Donated a singular Cent"
    },
    {
      name: "Webraft",
      image: "webraft.png",
      role: "AI Provider"
    },
    {
      name: "Edamam",
      image: "edamam.png",
      role: "Recipe Provider"
    }
  ]
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
              <div className="flex space-x-2">
      <div className="bg-slate-900 rounded-xl shadow-lg p-8 space-y-6 card">
        <h1 className="text-4xl text-white font-bold text-center">ReciMaster</h1>
        <h3 className="text-2xl text-white font-bold text-center">Search <span className="italic">some</span> recipes</h3>

        <div className="flex space-x-2">
        <form action="/recipes" method="get" className="flex space-x-2">
  <input
    type="text"
    name="q"
    className="p-2 w-64 rounded-lg bg-slate-700 text-white"
    placeholder="Search for recipes..."
  />
  <button type="submit" className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
    Search
  </button>
</form>
        </div>
        <p className="text-white text-center text-sm"> or </p>
        <div className="flex space-x-2">
        <a className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 transition-colors justify-center items-center" href="/recipes?q=">
          Browse All Recipes
        </a>
        <a className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 transition-colors justify-center items-center" href="/recipes?q=New">
          Discover New Recipes
        </a>
        </div>
      </div>
      <div className="bg-slate-900 rounded-xl shadow-lg p-8 space-y-6 card">
        <h2 className="text-2xl text-white font-bold">Already have set ingredients?</h2>
        <p className="text-white">Enter the ingredients you have and we'll find recipes for you!</p>
        <p className="text-white">Separate each ingredient with a comma.</p>
        <form action="/recipes" method="get" className="flex space-x-2">
                  <input
            type="text"
            name="q"
            className="p-2 w-64 rounded-lg bg-slate-700 text-white"
            placeholder="Enter ingredients..."
          />
          <button type="submit" className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
            Find Recipes
          </button>
        </form>
      </div>
    </div>
   
    <div className="w-full max-w-4xl bg-slate-900 rounded-xl shadow-lg p-8 mt-auto">
        <h4 className="text-white text-center text-xl font-semibold mb-6">Team:</h4>
        <div className="flex justify-center space-x-8">
          {team.map((sponsor, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                <Image 
                  src={`/${sponsor.image}`} 
                  alt={sponsor.name} 
                  width={80} 
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-sm text-gray-400">{sponsor.name}</p>
              <p className="text-xs text-gray-500">{sponsor.role}</p>
            </div>
          ))}
        </div>
      </div>

   
    </main>
  );
}