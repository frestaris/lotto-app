interface AutoPickResultProps {
  mainNumbers: number[];
  specialNumbers: number[];
}

export default function AutoPickResult({
  mainNumbers,
  specialNumbers,
}: AutoPickResultProps) {
  return (
    <div className="max-w-3xl mx-auto mt-10 text-center">
      <h3 className="text-xl font-semibold mb-4 text-gray-200">
        Your Auto Pick Numbers
      </h3>
      <div className="flex justify-center flex-wrap gap-3">
        {mainNumbers.map((num) => (
          <span
            key={num}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-400 text-black font-bold text-lg"
          >
            {num}
          </span>
        ))}
        {specialNumbers.map((num) => (
          <span
            key={`special-${num}`}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-500 text-black font-bold text-lg"
          >
            {num}
          </span>
        ))}
      </div>
    </div>
  );
}
