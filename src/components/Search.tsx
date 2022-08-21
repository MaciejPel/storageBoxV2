import { SearchIcon, FilterIcon, XIcon } from '@heroicons/react/outline';
import { FilterIcon as FilterIconSolid } from '@heroicons/react/solid';
import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/solid';
import { trpc } from '../utils/trpc';

interface SearchProps {
	setQuery: React.Dispatch<React.SetStateAction<{ string: string; tags: string[]; sort: boolean }>>;
	query: { string: string; tags: string[]; sort: boolean };
}

const Search: React.FC<SearchProps> = ({ setQuery, query }) => {
	const tagsQuery = trpc.useQuery(['tag.all']);

	return (
		<div className="w-full flex items-center">
			<input
				type="text"
				className="input input-bordered w-full rounded-r-none focus:outline-0"
				onChange={(e) => setQuery({ ...query, string: e.target.value.toLowerCase() })}
				value={query.string}
				placeholder="Search..."
				id="search"
			/>
			<label htmlFor="search" className="btn rounded-l-none no-animation ">
				<SearchIcon className="w-6 " />
			</label>

			<div className="dropdown dropdown-end sticky">
				<label tabIndex={0} className="btn m-1">
					{query.tags.length ? <FilterIconSolid className="w-6" /> : <FilterIcon className="w-6" />}
				</label>
				<ul
					tabIndex={0}
					className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-80 grid grid-cols-2"
				>
					{tagsQuery.isSuccess &&
						tagsQuery.data.map((tag) => (
							<li key={tag.id}>
								<label htmlFor={'filter-' + tag.id} className="label flex justify-start">
									<input
										id={'filter-' + tag.id}
										type="checkbox"
										className="checkbox label-text"
										value={tag.id}
										name="tagQuery"
										checked={query.tags.includes(tag.id)}
										onChange={(e) => {
											setQuery({
												...query,
												tags:
													e.target.checked === true
														? [...query.tags, e.target.value]
														: query.tags.filter((tag) => tag != e.target.value),
											});
										}}
									/>
									{tag.name}
								</label>
							</li>
						))}
				</ul>
			</div>
			<button
				title="Sort items"
				className="btn mr-1"
				type="button"
				onClick={() => setQuery({ ...query, sort: !query.sort })}
			>
				{query.sort ? (
					<SortDescendingIcon className="w-6" />
				) : (
					<SortAscendingIcon className="w-6" />
				)}
			</button>
			<button
				title="Clear search parameters"
				className="btn"
				type="button"
				onClick={() => setQuery({ string: '', tags: [], sort: true })}
			>
				<XIcon className="w-6" />
			</button>
		</div>
	);
};
export default Search;
