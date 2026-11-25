import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";

type TeamMemberCardProps = {
  image: string;
  alt: string;
  role: string;
  name: string;
  description: string;
};

export function TeamMemberCard({ image, alt, role, name, description }: TeamMemberCardProps) {
  return (
    <Reveal as="article" className="team-card">
      <div className="team-photo">
        <Photo src={image} alt={alt} sizes="(max-width: 620px) 50vw, 240px" />
        <span>{role}</span>
      </div>
      <h3>{name}</h3>
      <p>{description}</p>
    </Reveal>
  );
}
