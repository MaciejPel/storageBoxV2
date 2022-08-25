/* eslint-disable @next/next/no-img-element */
import { HeartIcon, PhotographIcon } from '@heroicons/react/solid';
import { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import Masonry from 'react-masonry-css';
import Container from '../../components/Container';
import Search from '../../components/Search';
import { bunnyCDN } from '../../utils/constants';
import { trpc } from '../../utils/trpc';
import { authOptions } from '../api/auth/[...nextauth]';

interface QueryParams {
	string: string;
	sort: boolean;
}

const breakpointColumnsObj = {
	default: 5,
	1536: 4,
	1280: 3,
	1024: 3,
	768: 2,
	640: 1,
};

const TagsPage: NextPage = () => {
	const { data: session, status } = useSession();
	const [query, setQuery] = useState<QueryParams>({ string: '', sort: true });

	const tagsQuery = trpc.useQuery(['tag.all'], {
		enabled: session ? true : false,
	});

	return (
		<Container type="start">
			<div className="w-full flex items-center gap-1 md:flex-row flex-col mb-2">
				<Search setQuery={setQuery} query={query} />
			</div>
			{tagsQuery.isError && <Container type="center">Something went wrong</Container>}
			{tagsQuery.isLoading && <Container type="center">Loading data ⌚</Container>}
			{tagsQuery.isSuccess && tagsQuery.data.length === 0 && (
				<Container type="center">Pretty empty in here 🏜</Container>
			)}
			<Masonry
				breakpointCols={breakpointColumnsObj}
				className="flex w-full gap-4"
				columnClassName="masonry-grid-column"
			>
				{tagsQuery.isSuccess &&
					tagsQuery.data
						.filter((tag) => {
							return tag.name.toLowerCase().includes(query.string);
						})
						.sort((f, s) => {
							if (f.characterIds.length < s.characterIds.length) return query.sort ? 1 : -1;
							if (f.characterIds.length > s.characterIds.length) return query.sort ? -1 : 1;
							return 0;
						})
						.map((tag) => (
							<Link href={`/tag/${tag.id}`} key={tag.id}>
								<div className="card card-compact static bg-base-100 card-bordered cursor-pointer mb-4">
									{tag?.cover ? (
										<img
											src={`${bunnyCDN}/${tag.cover.id}.${tag.cover.fileExtension}`}
											alt={`${tag.cover.fileName}.${tag.cover.fileExtension}`}
										/>
									) : (
										<PhotographIcon />
									)}
									<div className="card-body w-full bg-base-300">
										<div>
											<h2 className="card-title !mb-0">{tag.name}</h2>
										</div>
										<div className="card-actions justify-end">
											<button className="flex gap-1 text-base">
												<HeartIcon className="w-6 fill-red-500" />
												{tag.characterIds.length}
											</button>
										</div>
									</div>
								</div>
							</Link>
						))}
			</Masonry>
		</Container>
	);
};
export default TagsPage;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: '/login',
				pernament: false,
			},
		};
	}
	return { props: { session } };
};
