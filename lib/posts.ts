import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {remark} from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'blogposts');

export function getSortedPostsData(){
    // get file names under /posts
    const filenames = fs.readdirSync(postsDirectory);
    const allPostsData = filenames.map((filename)=>{
        // remove ".md" from file name to get id
        const id = filename.replace(/\.md$/, '');

        // read markdown file as string
        const fullpath = path.join(postsDirectory, filename);
        const fileContents = fs.readFileSync(fullpath, "utf-8");

        // use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        const blogPost: BlogPost = {
            id,
            title: matterResult.data.title,
            date: matterResult.data.date
        }

        // combine the data with the id
        return blogPost;
    })
    // sort posts by date
    return allPostsData.sort((a, b)=> a.date < b.date ? 1 : -1);
}

export async function getPostData(id: string){
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf-8')

    // use grey-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    const processedContent = await remark().use(html).process(matterResult.content)

    const contentHtml = processedContent.toString()

    const blogPostWithHtml: BlogPost & {contentHtml: string } = {
        id,
        title: matterResult.data.title,
        date: matterResult.data.date,
        contentHtml,
    }

    // combine the date with the id
    return blogPostWithHtml
}