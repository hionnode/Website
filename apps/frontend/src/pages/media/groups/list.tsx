import Grid from "@/lib/components/Grid";
import { BaseDisplayItem } from "@/lib/components/MediaComponents";
import { APP_ROUTES } from "@/lib/constants";
import { useCoreDetails } from "@/lib/hooks/graphql";
import LoadingPage from "@/lib/layouts/LoadingPage";
import LoggedIn from "@/lib/layouts/LoggedIn";
import { gqlClient } from "@/lib/services/api";
import {
	ActionIcon,
	Box,
	Center,
	Container,
	Grid as MantineGrid,
	Pagination,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { useDebouncedState, useLocalStorage } from "@mantine/hooks";
import { MetadataGroupsListDocument } from "@ryot/generated/graphql/backend/graphql";
import { changeCase, getInitials, snakeCase } from "@ryot/ts-utils";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { type ReactElement, useEffect } from "react";
import { withQuery } from "ufo";
import type { NextPageWithLayout } from "../../_app";

const Page: NextPageWithLayout = () => {
	const [query, setQuery] = useLocalStorage({
		key: "savedGroupsQuery",
		getInitialValueInEffect: false,
	});
	const [activePage, setPage] = useLocalStorage({
		defaultValue: "1",
		key: "savedGroupsPage",
		getInitialValueInEffect: false,
	});
	const [debouncedQuery, setDebouncedQuery] = useDebouncedState(query, 1000);
	const coreDetails = useCoreDetails();

	const listMetadataGroups = useQuery({
		queryKey: ["metadataGroupsList", activePage, debouncedQuery],
		queryFn: async () => {
			const { metadataGroupsList } = await gqlClient.request(
				MetadataGroupsListDocument,
				{
					input: {
						page: Number(activePage || 1),
						query: debouncedQuery.length > 0 ? debouncedQuery : undefined,
					},
				},
			);
			return metadataGroupsList;
		},
		staleTime: Infinity,
	});

	useEffect(() => {
		setDebouncedQuery(query?.trim() || "");
	}, [query]);

	const ClearButton = () =>
		query ? (
			<ActionIcon onClick={() => setQuery("")}>
				<IconX size="1rem" />
			</ActionIcon>
		) : undefined;

	return coreDetails.data ? (
		<>
			<Head>
				<title>List Groups | Ryot</title>
			</Head>
			<Container>
				<Stack>
					<MantineGrid grow>
						<MantineGrid.Col span={12}>
							<TextInput
								name="query"
								placeholder={"Search for groups"}
								icon={<IconSearch />}
								onChange={(e) => setQuery(e.currentTarget.value)}
								value={query}
								rightSection={<ClearButton />}
								style={{ flexGrow: 1 }}
								autoCapitalize="none"
								autoComplete="off"
							/>
						</MantineGrid.Col>
					</MantineGrid>
					{listMetadataGroups.data &&
					listMetadataGroups.data.details.total > 0 ? (
						<>
							<Box>
								<Text display={"inline"} fw="bold">
									{listMetadataGroups.data.details.total}
								</Text>{" "}
								items found
							</Box>
							<Grid>
								{listMetadataGroups.data.items.map((group) => (
									<BaseDisplayItem
										name={group.title}
										bottomLeft={`${group.parts} items`}
										bottomRight={changeCase(snakeCase(group.lot))}
										imageLink={group.image}
										imagePlaceholder={getInitials(group.title)}
										key={group.id}
										href={withQuery(APP_ROUTES.media.groups.details, {
											id: group.id,
										})}
									/>
								))}
							</Grid>
						</>
					) : (
						<Text>No information to display</Text>
					)}
					{listMetadataGroups.data ? (
						<Center>
							<Pagination
								size="sm"
								value={parseInt(activePage)}
								onChange={(v) => setPage(v.toString())}
								total={Math.ceil(
									listMetadataGroups.data.details.total /
										coreDetails.data.pageLimit,
								)}
								boundaries={1}
								siblings={0}
							/>
						</Center>
					) : undefined}
				</Stack>
			</Container>
		</>
	) : (
		<LoadingPage />
	);
};

Page.getLayout = (page: ReactElement) => {
	return <LoggedIn>{page}</LoggedIn>;
};

export default Page;
