import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

const reviews = [
  {
    name: "Rob Austin",
    bio: "Founder of shadcnblocks",
    body: "Looks amazing 🤩",
    img: "https://pbs.twimg.com/profile_images/1902211854476439552/CTVSPPo1_400x400.jpg",
  },
  {
    name: "Bilal Bakr",
    bio: "Co-founder of Calendaty",
    body: "Wow looks sickkkk \n Gotta give it a shot",
    img: "https://pbs.twimg.com/profile_images/1965065977436991488/f9FD6oer_400x400.jpg",
  },
  {
    name: "Kushal",
    bio: "25 | Building things",
    body: "Bro, really appreciate your efforts in making the product first, then this great visual hook video and all you are giving away for free. Hats off dude.",
    img: "https://pbs.twimg.com/profile_images/1996490150264889344/KA5Wr5i3_400x400.jpg",
  },
  {
    name: "Patel Meet",
    bio: "web dev | ai & tech enthusiast",
    body: "congrats on shipping it!!! interacted with all the components and it feels smooth throughout. keep building and adding more...",
    img: "https://pbs.twimg.com/profile_images/1451865652457717764/xpBuUbkB_400x400.jpg",
  },
  {
    name: "Zion",
    bio: "akingonzion",
    body: "These are actually amazing💥, definitely using some of these in a project of mine.",
    img: "https://pbs.twimg.com/profile_images/2006752020804354048/0w4PqgY9_400x400.jpg",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  bio,
  body,
}: {
  img: string;
  name: string;
  bio: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4 transition-colors",
        "border-border bg-card/50 hover:bg-card text-foreground"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-foreground">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-muted-foreground">{bio}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">
        {body}
      </blockquote>
    </figure>
  );
};

export function Testimonial() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.bio} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.bio} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-background to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-background to-transparent"></div>
    </div>
  );
}
