import Image from 'next/image'

const Img = (source, height, width, alt) => (
	<Image
		src={source}
		height={height}
		width={width}
		alt={alt}
	/>
)
