import { AlbumCard } from "@/components/album-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { $api } from "@/lib/api";
import { amGetImage } from "@/lib/apple-music";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/artist/$artistId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    return { artistId: params.artistId };
  },
});

function RouteComponent() {
  const { artistId } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/artist/$artistId" });
  const { isPending, data, isError } = $api.useQuery(
    "get",
    "/api/v1/am/artist",
    {
      params: { query: { id: artistId } },
    }
  );

  if (isPending) return <></>;

  if (isError) {
    return (
      <main className="flex flex-col items-center justify-start p-8 gap-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>oopsy</CardTitle>
            <CardDescription>an error occurred</CardDescription>
          </CardHeader>
          <CardFooter className="flex-col gap-2">
            <Link to="/">
              <Button variant="link">return to home</Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-start justify-start p-8 gap-4 w-full">
      <div className="flex flex-row">
        {data.attributes && (
          <div className="flex flex-row gap-4 items-center">
            <div>
              <img
                className="left-0 top-0 w-full h-full object-cover object-center transition duration-50"
                loading="lazy"
                src={amGetImage(data, 3000, 1000)}
              ></img>
              <div className="relative">
                <div className="absolute bottom-2 left-2 flex flex-col">
                  <p className="text-3xl">{data.attributes.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight pt-8">
        Discography
      </h1>
      <div className="dark:scheme-dark grid grid-auto-cols grid-flow-col grid-rows-1 max-w-[95vw] overflow-x-scroll gap-4 p-4">
        {data.relationships &&
          data.relationships.albums?.data
            .filter((item) => !item.attributes?.isSingle)
            .map((item, index) => (
              <AlbumCard
                className="max-w-[400px] min-w-xs"
                navigate={navigate}
                item={item}
                key={index}
              />
            ))}
      </div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight pt-8">
        Singles & EP
      </h1>
      <div className="dark:scheme-dark grid grid-auto-cols grid-flow-col grid-rows-1 max-w-[95vw] overflow-x-scroll gap-4 p-4">
        {data.relationships &&
          data.relationships.albums?.data
            .filter((item) => item.attributes?.isSingle)
            .map((item, index) => (
              <AlbumCard
                className="max-w-[400px] min-w-xs"
                navigate={navigate}
                item={item}
                key={index}
              />
            ))}
      </div>
    </main>
  );
}
