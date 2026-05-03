import { memo } from 'react';
import TIMELINES from '../data/timelines';

export default memo(function ElectionTimeline({ country }) {
  const steps = TIMELINES[country.id] || TIMELINES.india;

  return (
    <section aria-label="Election timeline">
      <h2 className="text-lg font-bold mb-6" style={{ color: country.accent }}>
        {country.name} Election Timeline
      </h2>

      <ol className="relative list-none p-0" role="list">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" aria-hidden="true"></div>

        {steps.map((phase, pi) => (
          <li key={pi} className="mb-8" aria-label={`Phase ${pi + 1}: ${phase.phase}`}>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className={`w-8 h-8 rounded-full ${phase.color} flex items-center justify-center text-white text-xs font-bold`} aria-hidden="true">
                {pi + 1}
              </div>
              <h3 className="font-semibold text-gray-800">{phase.phase}</h3>
            </div>

            <div className="ml-12 space-y-3">
              {phase.steps.map((step, si) => (
                <details
                  key={si}
                  className="group bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-800 list-none flex items-center justify-between">
                    {step.title}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">
                      ▾
                    </span>
                  </summary>
                  <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">
                    {step.detail}
                  </p>
                </details>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
});
