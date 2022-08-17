const Container = ({ children, type }: { children: React.ReactNode; type: string }) => {
	return (
		<main
			className={`px-4 lg:px-8 flex flex-1 flex-col items-center lg:w-4/5 w-full ${
				type === 'center' ? 'justify-center pb-20' : 'justify-start'
			}`}
		>
			{children}
		</main>
	);
};

export default Container;
