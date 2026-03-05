import ClientPage from './ProductClient';

export default function ProductServerPage({ params }: { params: { product: string } }) {
    return <ClientPage params={params} />;
}
