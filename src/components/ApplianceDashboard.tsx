import { cn } from "@/lib/utils";
import { Lightbulb, Fan, Power } from "lucide-react";

interface ApplianceDashboardProps {
  lightOn: boolean;
  fanOn: boolean;
  className?: string;
}

const ApplianceDashboard = ({ lightOn, fanOn, className }: ApplianceDashboardProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Power className="w-5 h-5 text-primary" />
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
          Appliance Control
        </h3>
      </div>

      {/* Light Control */}
      <div
        className={cn(
          "relative p-6 rounded-xl border transition-all duration-500",
          lightOn
            ? "border-warning/50 bg-warning/10 glow-primary"
            : "border-border bg-card/50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500",
                lightOn
                  ? "bg-warning text-warning-foreground shadow-[0_0_30px_hsl(38,92%,50%,0.5)]"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <Lightbulb className={cn("w-7 h-7", lightOn && "drop-shadow-lg")} />
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold">Light</h4>
              <p className="text-sm text-muted-foreground">Living Room</p>
            </div>
          </div>
          
          <div className="text-right">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                lightOn
                  ? "bg-warning/20 text-warning border border-warning/30"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  lightOn ? "bg-warning animate-pulse" : "bg-muted-foreground/50"
                )}
              />
              {lightOn ? "ON" : "OFF"}
            </div>
          </div>
        </div>

        {/* Light rays effect */}
        {lightOn && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            <div className="absolute top-1/2 left-8 -translate-y-1/2 w-32 h-32">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-gradient-to-t from-warning/30 to-transparent origin-bottom"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-100%)`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fan Control */}
      <div
        className={cn(
          "relative p-6 rounded-xl border transition-all duration-500",
          fanOn
            ? "border-primary/50 bg-primary/10 glow-primary"
            : "border-border bg-card/50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500",
                fanOn
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <Fan
                className={cn(
                  "w-7 h-7 transition-transform",
                  fanOn && "animate-spin"
                )}
                style={{ animationDuration: fanOn ? "1s" : "0s" }}
              />
            </div>
            <div>
              <h4 className="font-display text-lg font-semibold">Fan</h4>
              <p className="text-sm text-muted-foreground">Ceiling Fan</p>
            </div>
          </div>
          
          <div className="text-right">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                fanOn
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  fanOn ? "bg-primary animate-pulse" : "bg-muted-foreground/50"
                )}
              />
              {fanOn ? "ON" : "OFF"}
            </div>
          </div>
        </div>

        {/* Wind effect */}
        {fanOn && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1 opacity-50">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 h-6 bg-primary/50 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplianceDashboard;