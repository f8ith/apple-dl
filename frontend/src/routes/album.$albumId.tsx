import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { $api } from "@/lib/api";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/album/$albumId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    return { albumId: params.albumId }
  },
});

function RouteComponent() {
  const { albumId } = Route.useLoaderData();
  const { isPending, data, isError } = $api.useQuery("get", "/api/v1/am/album", {
    params: { query: { id: albumId } },
  });

  if (isPending)
    return <></>

  if (isError) {
    return (
      <main className="flex flex-col items-start justify-start p-8 gap-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>oopsy</CardTitle>
            <CardDescription>
              an error occurred
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-col gap-2">
            <Link
              to="/"
            >
              {/* TODO Side effect: navigates to /discord-bot */}
              <Button variant="link">
                return to home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-start justify-start p-8 gap-4">
      <div>

      </div>
      <div className="flex flex-col items-center justify-center">
        <Table className="mx-auto">
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>TITLE</TableHead>
              <TableHead>ARTIST</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.relationships && data.relationships.tracks.data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{index}</TableCell>
                <TableCell>{item.attributes.name}</TableCell>
                <TableCell>{item.attributes.artistName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>)
}
