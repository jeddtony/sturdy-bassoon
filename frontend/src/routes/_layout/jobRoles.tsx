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
} from "@chakra-ui/react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import { JobRoleService } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import AddJobRole from "../../components/Items/AddJobRole";

const jobRolesSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute("/_layout/jobRoles")({
  component: JobRoles,
  validateSearch: (search) => jobRolesSearchSchema.parse(search),
});

const PER_PAGE = 10;

function getJobRolesQueryOptions({ page }: { page: number }) {
    return {
      queryFn: () =>
        JobRoleService.readJobRoles({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
      queryKey: ["job-roles", { page }],
    }
  }
  
  function JobRolesTable() {
    const queryClient = useQueryClient()
    const { page } = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })
    const setPage = (page: number) =>
      navigate({ search: (prev) => ({ ...prev, page }) })
  
    const {
      data: jobRoles,
      isPending,
      isPlaceholderData,
    } = useQuery({
      ...getJobRolesQueryOptions({ page }),
      placeholderData: (prevData) => prevData,
    })
  
    const hasNextPage = !isPlaceholderData && jobRoles?.data.length === PER_PAGE
    const hasPreviousPage = page > 1
  
    useEffect(() => {
      if (hasNextPage) {
        queryClient.prefetchQuery(getJobRolesQueryOptions({ page: page + 1 }))
      }
    }, [page, queryClient, hasNextPage])
  
    return (
        <>
        <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
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
                jobRoles?.data.map((jobRole) => (
                    <>
                  <Tr key={jobRole.id}>
                    <Td>{jobRole.name}</Td>
                    <Td>{jobRole.description}</Td>
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
    );
  }

function JobRoles() {
    return (
      <Container maxW="full">
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
          Job Roles
        </Heading>
  
        <Navbar type={"Job Roles"} addModalAs={AddJobRole} />
        <JobRolesTable />
      </Container>
    )
  }