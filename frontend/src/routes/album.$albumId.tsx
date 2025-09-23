import {AddToDiscord} from "@/components/add-to-discord";
import { DownloadButton } from "@/components/download-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { $api } from "@/lib/api";
import { amGetImage } from "@/lib/apple-music";
import { millisToStr } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/album/$albumId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    return { albumId: params.albumId };
  },
});

function RouteComponent() {
  const { albumId } = Route.useLoaderData();
  const { isPending, data, isError } = $api.useQuery(
    "get",
    "/api/v1/am/album",
    {
      params: { query: { id: albumId } },
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
            <div className="max-w-[16vh] max-h-[16vh]">
              <img
                className="left-0 top-0 max-w-[16vh] h-full object-cover object-center transition duration-50 rounded-lg"
                loading="lazy"
                src={amGetImage(data)}
              ></img>
            </div>
            <div className="flex flex-col">
              <p className="text-3xl">{data.attributes.name}</p>
              {data.relationships?.artists.data[0] &&
                <Link to="/artist/$artistId" params={{ artistId: data.relationships.artists.data[0].id }}>
                  <p className="text-left text-xl text-muted-foreground hover:underline">
                    {`${data.attributes.artistName}`}
                  </p>
                </Link>
              }
            </div>
          </div>
        )}
      </div>
      <div className="dark:scheme-dark flex flex-col items-center justify-center w-full max-h-[60vh] h-fit">
        <Table className="mx-auto">
          <TableHeader className="sticky top-0 z-[10] z-10 bg-background shadow-sm">
            <TableRow>
              <TableHead className="w-[100px]"></TableHead>
              <TableHead>TITLE</TableHead>
              <TableHead>DURATION</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="flex-1 overflow-auto">
            {data.relationships &&
              data.relationships.tracks.data.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="w-full">
                    <div className="flex flex-row gap-4 items-center">
                     <div className="flex flex-col">
                        <p>{item.attributes.name}</p>
                        <p className="text-muted-foreground">{item.attributes.artistName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.attributes.durationInMillis ? millisToStr(item.attributes.durationInMillis) : ""}
                  </TableCell>
                  <TableCell className="flex flex-row gap-2 justify-end">
                    <AddToDiscord url={item.attributes.url} type={item.type} />
                    <DownloadButton url={item.attributes.url} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
