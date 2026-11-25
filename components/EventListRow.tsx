import { AppLink } from "@/components/AppLink";
import { Reveal } from "@/components/Reveal";

type EventListRowProps = {
  day: string;
  month: string;
  category: string;
  title: string;
  description: string;
  primaryDetail: string;
  secondaryDetail: string;
  href: string;
  ariaLabel: string;
  muted?: boolean;
};

export function EventListRow({
  day,
  month,
  category,
  title,
  description,
  primaryDetail,
  secondaryDetail,
  href,
  ariaLabel,
  muted = false
}: EventListRowProps) {
  return (
    <Reveal as="article" className="event-row">
      <div className={`event-date${muted ? " event-date-muted" : ""}`}>
        <strong>{day}</strong><span>{month}</span>
      </div>
      <div className="event-main">
        <span className="event-label">{category}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="event-meta"><span>{primaryDetail}</span><span>{secondaryDetail}</span></div>
      <AppLink className="event-link" href={href} aria-label={ariaLabel}>↗</AppLink>
    </Reveal>
  );
}
