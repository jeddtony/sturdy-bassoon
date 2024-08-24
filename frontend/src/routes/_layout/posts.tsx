import {
    Button,
    Container,
    Flex,
    Heading,
    SkeletonText,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
  } from "@chakra-ui/react"
  import { useQuery, useQueryClient } from "@tanstack/react-query"
  import { createFileRoute, useNavigate } from "@tanstack/react-router"
  import { useEffect } from "react"
  import { z } from "zod"
  
  import { PostService } from "../../client"
  import ActionsMenu from "../../components/Common/ActionsMenu"
  import Navbar from "../../components/Common/Navbar"
  import AddItem from "../../components/Items/AddItem"
  
  const itemsSearchSchema = z.object({
    page: z.number().catch(1),
  })

  export const Route = createFileRoute("/_layout/posts")({
    component: Posts,
    validateSearch: (search) => itemsSearchSchema.parse(search),
  })

  const PER_PAGE = 5

  function getItemsQueryOptions({ page }: { page: number }) {
    return {
      queryFn: () =>
        PostService.readPosts({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
      queryKey: ["posts", { page }],
    }
  }

  function PostsTable() {
    const queryClient = useQueryClient()
    const { page } = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })
    const setPage = (page: number) =>
      navigate({ search: (prev) => ({ ...prev, page }) })
  
    const {
      data: posts,
      isPending,
      isPlaceholderData,
    } = useQuery({
      ...getItemsQueryOptions({ page }),
      placeholderData: (prevData) => prevData,
    })
  
    const hasNextPage = !isPlaceholderData && posts?.data.length === PER_PAGE
    const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getItemsQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])
  
    return (
      <>
        <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Content</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isPending ? (
                <Tr>
                  {new Array(3).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
                </Tr>
              ) : (
                posts?.data.map((post) => (
                    <>
                  <Tr key={post.id}>
                    <Td>{post.title}</Td>
                    <Td>{post.content}</Td>
                    <Td>
                      {/* <ActionsMenu type="post" id={post.id} /> */}
                    </Td>
                  </Tr>
                  </>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
        <Flex justify="space-between" mt={4}>
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={!hasNextPage}
            variant="outline"
          >
            Next
          </Button>
        </Flex>
      </>
    )
}

function Posts() {
    return (
        <Container maxW="futll">
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
          Posts Things
        </Heading>
  
        <Navbar type={"Posts"} 
        addModalAs={AddItem}
         />
        <PostsTable />
      </Container>
    )
}