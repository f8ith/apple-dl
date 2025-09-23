import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createFileRoute,
  Link,
  redirect,
  stripSearchParams,
} from "@tanstack/react-router";

type DiscordBotSearch = {
  player_id: string | null;
};

export const Route = createFileRoute("/discord-bot")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): DiscordBotSearch => {
    return {
      player_id: search.player_id ? (search.player_id as string) : null,
    };
  },
  beforeLoad: ({ search }) => {
    if (search.player_id) {
      sessionStorage.setItem("player_id", JSON.stringify(search.player_id));
      throw redirect({ to: "/" });
    }

    // Return or redirect as needed
    return {};
  },
  search: {
    // strip default values
    middlewares: [stripSearchParams(true)],
  },
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-sm items-center">
        <CardHeader>
          <CardTitle>invalid player id</CardTitle>
        </CardHeader>
        <CardFooter className="flex-col gap-2">
          <Button asChild className="w-full" variant="link">
            <Link to="/">return to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
