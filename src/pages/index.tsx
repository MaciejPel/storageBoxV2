/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { authOptions } from './api/auth/[...nextauth]';
import { trpc } from '../utils/trpc';
import { defaultBreakpointColumns } from '../utils/constants';
import { HeartIcon } from '@heroicons/react/solid';
import Masonry from 'react-masonry-css';
import Container from '../components/Container';
import Card from '../components/Card';
import Search from '../components/Search';
import Modal from '../components/Modal';
import CharacterForm from '../components/forms/CharacterForm';

interface QueryParams {
	string: string;
	tags?: string[];
	sort: boolean;
}

const Home: NextPage = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [query, setQuery] = useState<QueryParams>({ string: '', tags: [], sort: true });
	const [modal, setModal] = useState<{ tag: boolean; character: boolean }>({
		tag: false,
		character: false,
	});

	const charactersQuery = trpc.useQuery(['character.all'], {
		enabled: session ? true : false,
	});

	useEffect(() => {
		// solve problem with invalid redirect on signOut, however this solution causes problem with `Loading initial props cancelled`
		if (status === 'unauthenticated') router.push('/login');
	}, [status, router]);

	return (
		<Container type="start">
			<h2 className="text-4xl font-extrabold my-4 text-start w-full mt-0 mb-2">Characters</h2>
			<div className="w-full flex items-center gap-1 md:flex-row flex-col mb-2">
				<Search
					setQuery={setQuery}
					query={query}
				/>
				<button
					type="button"
					title="Add character"
					onClick={() => setModal({ ...modal, character: true })}
					className="btn md:w-auto w-full"
				>
					Add character
				</button>
				<Modal
					open={modal.character}
					onClose={() => setModal({ ...modal, character: false })}
					modalTitle="New character"
				>
					<CharacterForm closeModal={() => setModal({ ...modal, character: false })} />
				</Modal>
			</div>
			{charactersQuery.isError && <Container type="center">Something went wrong</Container>}
			{charactersQuery.isLoading && <Container type="center">Loading data ⌚</Container>}
			{charactersQuery.isSuccess && charactersQuery.data.length === 0 && (
				<Container type="center">Pretty empty in here 🏜</Container>
			)}
			<Masonry
				breakpointCols={defaultBreakpointColumns}
				className="flex w-full gap-4"
				columnClassName="masonry-grid-column"
			>
				{charactersQuery.isSuccess &&
					charactersQuery.data
						.filter((character) => {
							const characterTags = character.tags.map((tag) => tag.id);
							return (
								(character.name.toLowerCase().includes(query.string) ||
									(character.description &&
										character.description.toLowerCase().includes(query.string))) &&
								query.tags &&
								query.tags.every((tag) => characterTags.includes(tag))
							);
						})
						.sort((f, s) => {
							const likesF =
									f.media.reduce((acc, media) => acc + media.likeIds.length, 0) +
									(f.cover?.likeIds.length || 0),
								likesS =
									s.media.reduce((acc, media) => acc + media.likeIds.length, 0) +
									(s.cover?.likeIds.length || 0);
							if (likesF < likesS) return query.sort ? 1 : -1;
							if (likesF > likesS) return query.sort ? -1 : 1;
							return 0;
						})
						.map((character) => (
							<Link
								href={`/character/${character.id}`}
								key={character.id}
							>
								<a>
									<Card
										media={character.cover?.mimetype.includes('image') ? character.cover : null}
										body={
											<>
												<div>
													<h2 className="card-title !mb-0">{character.name}</h2>
													<p className="truncate">{character.description}</p>
												</div>
												<p className="flex gap-1 flex-wrap">
													{character.tags.map((tag) => (
														<Link
															href={`/tag/${tag.id}`}
															key={tag.id}
														>
															<span
																className={`badge badge-md hover:bg-base-content hover:text-base-100 !py-3 cursor-pointer font-semibold ${
																	query.tags && query.tags.includes(tag.id)
																		? 'bg-success text-success-content'
																		: ''
																}`}
															>
																{tag.name}
															</span>
														</Link>
													))}
												</p>
											</>
										}
										actions={
											<button className="flex gap-1 text-base">
												<HeartIcon className="w-6 fill-red-500" />
												{character.media.reduce((acc, media) => acc + media.likeIds.length, 0) +
													(character.cover?.likeIds.length || 0)}
											</button>
										}
									/>
								</a>
							</Link>
						))}
			</Masonry>
		</Container>
	);
};

export default Home;

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
