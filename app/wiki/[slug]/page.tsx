import React from 'react'
import { notFound } from 'next/navigation'
import { getArticleBySlug, listArticles } from '@/lib/wiki-data'
import WikiArticleContent from '@/components/wiki/new/WikiArticleContent'
import WikiTableOfContents from '@/components/wiki/new/WikiTableOfContents'

// Next.js 15: params is a Promise
interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const articles = listArticles()
    return articles.map((article) => ({
        slug: article.slug,
    }))
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params
    const article = getArticleBySlug(slug)

    if (!article) {
        return {
            title: 'Guide Not Found - AuraFX Wiki',
        }
    }

    return {
        title: `${article.title} - AuraFX Wiki`,
        description: article.description,
    }
}

export default async function WikiArticlePage({ params }: PageProps) {
    const { slug } = await params
    const article = getArticleBySlug(slug)

    if (!article) {
        notFound()
    }

    return (
        <div className="flex gap-8 px-6 py-12 lg:px-12 max-w-[1600px] mx-auto">
            {/* Main Content */}
            <WikiArticleContent article={article} />

            {/* Table of Contents (Desktop only) */}
            <WikiTableOfContents sections={article.sections} />
        </div>
    )
}
