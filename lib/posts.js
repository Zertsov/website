import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const dir = path.join(process.cwd(), 'posts')

export function getSortedPostsData() {
	const fileNames = fs.readdirSync(dir)
	const postsData = fileNames.map(filename => {
		// ID is just the markdown file's name
		const id = filename.replace(/\.md$/, '')
		const fullPath = path.join(dir, filename)
		const contents = fs.readFileSync(fullPath, 'utf8')

		const matterResult = matter(contents)

		return { id, ...matterResult.data }
	})

	// return sorted data by date
	return postsData.sort(({ date: a }, { date: b }) => {
		if (a < b) {
			return 1
		} else if (a > b) {
			return -1
		}
		return 0
	})
}

export function getAllPostIds() {
	const fileNames = fs.readdirSync(dir)

	return fileNames.map(fn => {
		return {
			params: {
				id: fn.replace(/\.md$/, '')
			}
		}
	})
}

export function getPostData(id) {
	const fullPath = path.join(dir, `${id}.md`)
	const fileContents = fs.readFileSync(fullPath, 'utf8')
	const matterResult = matter(fileContents)

	return {
		id,
		...matterResult.data
	}
}