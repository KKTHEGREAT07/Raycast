type OptionsPanelProps = {
    speed: number;
    masterVolume: number;
    ambienceVolume: number;
    effectsVolume: number;
    onSpeedChange: (value: number) => void;
    onMasterVolumeChange: (value: number) => void;
    onAmbienceVolumeChange: (value: number) => void;
    onEffectsVolumeChange: (value: number) => void;
    onBack: () => void;
};

function SettingSlider({
    label,
    value,
    min,
    max,
    step,
    formatValue,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    formatValue: (value: number) => string;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block text-left text-sm tracking-wider text-zinc-300">
            <span className="mb-2 flex justify-between">
                <span>{label}</span>
                <span className="tabular-nums text-red-300">{formatValue(value)}</span>
            </span>
            <input
                className="w-full accent-red-600"
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.currentTarget.value))}
            />
        </label>
    );
}

export default function OptionsPanel(props: OptionsPanelProps) {
    const percent = (value: number) => `${Math.round(value * 100)}%`;

    return (
        <div className="w-[min(24rem,calc(100vw-2rem))] border border-red-950 bg-zinc-950/95 p-8 shadow-2xl shadow-black">
            <h1 className="mb-8 text-center text-3xl font-bold tracking-[0.2em] text-red-500">
                OPTIONS
            </h1>

            <div className="flex flex-col gap-6">
                <SettingSlider
                    label="MOVEMENT SPEED"
                    value={props.speed}
                    min={1}
                    max={8}
                    step={0.25}
                    formatValue={(value) => value.toFixed(2)}
                    onChange={props.onSpeedChange}
                />
                <SettingSlider
                    label="MASTER VOLUME"
                    value={props.masterVolume}
                    min={0}
                    max={1}
                    step={0.01}
                    formatValue={percent}
                    onChange={props.onMasterVolumeChange}
                />
                <SettingSlider
                    label="AMBIENCE"
                    value={props.ambienceVolume}
                    min={0}
                    max={1}
                    step={0.01}
                    formatValue={percent}
                    onChange={props.onAmbienceVolumeChange}
                />
                <SettingSlider
                    label="SOUND EFFECTS"
                    value={props.effectsVolume}
                    min={0}
                    max={1}
                    step={0.01}
                    formatValue={percent}
                    onChange={props.onEffectsVolumeChange}
                />
            </div>

            <button
                onClick={props.onBack}
                className="mt-8 w-full border border-zinc-700 bg-zinc-900 py-3 tracking-widest text-zinc-200 transition hover:border-red-700 hover:bg-zinc-800"
            >
                BACK
            </button>
        </div>
    );
}
