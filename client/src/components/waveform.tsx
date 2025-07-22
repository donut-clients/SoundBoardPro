interface WaveformProps {
  color: string;
}

export function Waveform({ color }: WaveformProps) {
  const bars = [20, 35, 15, 45, 30, 25, 40, 20];

  return (
    <div className="flex items-center justify-center h-16 space-x-1">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded ${color}`}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}
