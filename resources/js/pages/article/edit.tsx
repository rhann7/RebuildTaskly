import ResourceListLayout from '@/layouts/resource/resource-list-layout';
import { useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { FormEventHandler, useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, FileText } from 'lucide-react';

// Data types
type Category = {
    id: number;
    name: string;
};

type Article = {
    id: number;
    name: string;
    category_article_id: number;
};

type ArticleDetail = {
    description: string;
};

type PageProps = {
    article: Article;
    detail: ArticleDetail;
    categories: Category[];
    tinymce: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Article Management', href: '#' },
    { title: 'Articles', href: '/article-management/article' },
    { title: 'Edit Article', href: '/article-management/article/edit' },
];

export default function ArticleEdit({ article, detail, categories = [], tinymce }: PageProps) {
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        name: article?.name ?? '',
        description: detail?.description ?? '',
        category_article_id: article?.category_article_id?.toString() ?? '',
    });

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setData({
            ...data,
            description: editorRef.current?.getContent() ?? '',
        });
        put(`/article-management/article/${article.id}`, {
            onSuccess: () => {
                router.visit('/article-management/article');
            }
        });
    };

    const handleCancel = () => {
        router.visit('/article-management/article');
    };

    const HeaderActions = (
        <div className="flex items-center gap-2">
            <Button onClick={handleCancel} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
            </Button>
        </div>
    );

    return (
        <ResourceListLayout
            title="Edit Article"
            description="Edit your article details and content."
            breadcrumbs={breadcrumbs}
            headerActions={HeaderActions}
            isEmpty={false}
            config={{
                showFilter: false,
                showPagination: false,
                showPaginationInfo: false,
                showHeaderActions: true,
                showShadow: true,
                showBorder: true,
            }}
        >
            <div className="p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold flex items-center gap-2 mb-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Edit Article Information
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Update the details below to edit your article.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 mt-5">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Article Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter article title"
                                autoFocus
                                className="h-10"
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">
                                Category <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.category_article_id}
                                onValueChange={(value) => setData('category_article_id', value)}
                            >
                                <SelectTrigger id="category" className="h-10">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_article_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Article Content <span className="text-red-500">*</span>
                            </Label>
                            <Editor
                                apiKey={`${tinymce}`}
                                onInit={(evt, editor) => editorRef.current = editor}
                                value={data.description}
                                onEditorChange={(content) => {
                                    setData('description', content);
                                }}
                                init={{
                                    height: 500,
                                    menubar: true,
                                    skin: isDarkMode ? 'oxide-dark' : 'oxide',
                                    content_css: isDarkMode ? 'dark' : 'default',
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                    ],
                                    toolbar: 'undo redo | blocks | ' +
                                        'bold italic forecolor | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'removeformat | help',
                                    content_style: isDarkMode
                                        ? 'body { font-family: Instrument Sans, ui-sans-serif, system-ui, sans-serif; font-size: 14px; background-color: #252525; color: #fbfbfb; }'
                                        : 'body { font-family: Instrument Sans, ui-sans-serif, system-ui, sans-serif; font-size: 14px; background-color: #ffffff; color: #252525; }',
                                    branding: false,
                                    promotion: false,
                                }}
                                className="resize-none"
                            />
                            <InputError message={errors.description} />
                            <p className="text-xs text-muted-foreground">
                                Edit your article content here. This will be stored in the article details.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </ResourceListLayout>
    );
}
