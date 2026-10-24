import React, { useCallback, useState, useEffect } from 'react';
import type { AxiosError } from 'axios';
import { AlertTriangle, ArrowRight, Banknote, Check, CircleCheck, Handshake, MapPin, Package, Search, ShoppingBag, Sparkles, Store, X } from 'lucide-react';
import productApi from '@/services/productApi';
import { orderService, CreateOrderDTO } from '@/services/orderService';
import { formatKwanza } from '@/utils/format';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface ShowcaseImage {
    id: string;
    category: string;
    category_label: string;
    name: string;
    url: string;
}

interface OrderResult {
    tracking_code: string;
}

interface PublicLanding {
    products: Product[];
    showcase_images: ShowcaseImage[];
}

const getOrCreateGuestId = () => {
    const savedGuestId = localStorage.getItem('guest_id');

    if (savedGuestId) {
        return savedGuestId;
    }

    const guestId = `guest_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('guest_id', guestId);

    return guestId;
};

const showcaseCategories = [
    { id: 'automoveis', label: 'Automóveis', description: 'Novos caminhos começam aqui.', search: ['carro', 'mota', 'lancha', 'aviao'] },
    { id: 'electronicos', label: 'Tecnologia', description: 'Ideias que acompanham o seu ritmo.', search: ['telefone', 'laptop', 'computador', 'eletronico'] },
    { id: 'roupas', label: 'Moda e estilo', description: 'Encontre o seu próximo favorito.', search: ['roupa', 'vestido', 'camisa', 'moda'] },
];

const PublicProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [showcaseImages, setShowcaseImages] = useState<ShowcaseImage[]>([]);
    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [orderData, setOrderData] = useState<CreateOrderDTO>({
        product_id: 0,
        buyer_name: '',
        buyer_phone: '',
        buyer_address: '',
        buyer_email: '',
        buyer_notes: '',
        quantity: 1,
        guest_id: '',
    });

    const heroImages = showcaseCategories.flatMap(category =>
        showcaseImages.filter(image => image.category === category.id).slice(0, 4)
    );
    const heroImage = heroImages[heroImageIndex % Math.max(heroImages.length, 1)];

    //  Carregar produtos (rota pública)
    const loadProducts = useCallback(async () => {
        try {
            const response = await productApi.get('/products/public');
            setProducts(response.data);
        } catch (err: unknown) {
            console.error('Erro ao carregar produtos:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        void productApi.get<PublicLanding>('/products/landing')
            .then(response => {
                if (active) {
                    setProducts(response.data.products);
                    setShowcaseImages(response.data.showcase_images);
                }
            })
            .catch((err: unknown) => {
                console.error('Erro ao carregar a página pública:', err);
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        getOrCreateGuestId();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const availableHeroImages = showcaseCategories.flatMap(category =>
            showcaseImages.filter(image => image.category === category.id).slice(0, 4)
        );

        if (availableHeroImages.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        let active = true;
        let timer = 0;
        let nextImage: HTMLImageElement | undefined;

        timer = window.setTimeout(() => {
            const currentIndex = heroImageIndex % availableHeroImages.length;
            const nextIndex = Math.floor(Math.random() * (availableHeroImages.length - 1));
            const imageIndex = nextIndex >= currentIndex ? nextIndex + 1 : nextIndex;
            nextImage = new window.Image();
            nextImage.onload = () => {
                if (active) {
                    setHeroImageIndex(imageIndex);
                }
            };
            nextImage.src = availableHeroImages[imageIndex].url;
        }, 9000);

        return () => {
            active = false;
            window.clearTimeout(timer);
            if (nextImage) {
                nextImage.onload = null;
            }
        };
    }, [showcaseImages, heroImageIndex]);

    const handleBuy = (product: Product) => {
        setSelectedProduct(product);
        setOrderData(prev => ({ ...prev, product_id: product.id, quantity: 1 }));
        setShowCheckout(true);
        setError('');
        setShowSuccess(false);
    };

    const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setOrderData({
            ...orderData,
            [name]: name === 'quantity' ? parseInt(value) || 1 : value,
        });
    };

    //  Submeter pedido (usar orderService)
    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            //  Usar o orderService em vez de productApi direto
            const response = await orderService.criar({
                ...orderData,
                guest_id: getOrCreateGuestId(),
            });
            
            setShowCheckout(false);
            setShowSuccess(true);
            setOrderResult(response.order);
            
            // Recarregar produtos (para atualizar stock)
            loadProducts();
            
            // Guardar no histórico local
            const savedOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
            savedOrders.push({
                tracking_code: response.order.tracking_code,
                product_name: selectedProduct?.name,
                date: new Date().toISOString(),
            });
            localStorage.setItem('guest_orders', JSON.stringify(savedOrders));
            
        } catch (err) {
            console.error('Erro ao criar pedido:', err);
            const response = (err as AxiosError<{ error?: string; message?: string }>).response;
            setError(
                response?.data?.error ||
                response?.data?.message ||
                'Erro ao realizar pedido. Tente novamente.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Filtrar produtos pela busca
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (showSuccess && orderResult) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="bg-white border border-green-100 rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-green-100/50">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                        <CircleCheck aria-hidden="true" className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Pedido Realizado!
                    </h2>
                    <p className="text-gray-600 mb-8">
                        O vendedor foi notificado e entrará em contacto brevemente.
                    </p>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100">
                        <p className="text-sm text-gray-600 mb-2">Código de Rastreio</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                            {orderResult.tracking_code}
                        </p>
                        <p className="text-xs text-gray-500">
                            Guarde este código para acompanhar o seu pedido
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => {
                                setShowSuccess(false);
                                setSelectedProduct(null);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg shadow-indigo-200"
                        >
                            Continuar a Comprar
                        </button>
                        <a
                            href={`/track/${orderResult.tracking_code}`}
                            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 font-semibold"
                        >
                            Rastrear Pedido
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            <div className="bg-[#17231e] text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 text-center text-xs font-semibold tracking-wide sm:text-sm">
                    <Sparkles aria-hidden="true" className="h-4 w-4 text-amber-300" />
                    <span>Descubra bons achados, de vendedores locais para si</span>
                    <Sparkles aria-hidden="true" className="h-4 w-4 text-amber-300" />
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 lg:px-8 lg:pt-10">
                <section className="market-hero relative isolate min-h-[440px] overflow-hidden rounded-[2rem] bg-[#18221e] shadow-2xl shadow-emerald-950/15 md:min-h-[520px]">
                    {heroImage && (
                        <img
                            key={heroImage.id}
                            src={heroImage.url}
                            alt={`Destaque ${heroImage.category_label.toLowerCase()}`}
                            className="market-hero-image absolute inset-0 -z-20 h-full w-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101b17]/95 via-[#101b17]/75 to-[#101b17]/15" />
                    <div className="market-hero-orb absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

                    <div className="relative z-10 flex min-h-[440px] flex-col justify-center px-7 py-12 md:min-h-[520px] md:max-w-3xl md:px-14 lg:px-16">
                        <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                            <MapPin aria-hidden="true" className="h-4 w-4" />
                            <span>O melhor de Angola, num só lugar</span>
                        </div>

                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Mercado Aurora</p>
                        <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                            O próximo achado que vai <span className="text-amber-300">adorar.</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                            Explore automóveis, tecnologia e moda de vendedores locais. Escolha o que gosta e encomende com toda a simplicidade.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <a
                                href="#catalogo"
                                className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3.5 font-bold text-[#1b241e] shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-200"
                            >
                                Explorar produtos <ArrowRight aria-hidden="true" className="h-4 w-4 rotate-90" />
                            </a>
                            <a
                                href="#inspiracao"
                                className="rounded-full border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                            >
                                Ver categorias
                            </a>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/80">
                            <span className="inline-flex items-center gap-1.5"><Check aria-hidden="true" className="h-4 w-4 text-amber-300" /> Compra sem cadastro</span>
                            <span className="inline-flex items-center gap-1.5"><Check aria-hidden="true" className="h-4 w-4 text-amber-300" /> Pagamento na entrega</span>
                            <span className="inline-flex items-center gap-1.5"><Check aria-hidden="true" className="h-4 w-4 text-amber-300" /> Feito para Angola</span>
                        </div>
                    </div>

                    {heroImage && (
                        <div className="absolute bottom-6 right-6 hidden items-center gap-3 rounded-2xl border border-white/25 bg-[#17231e]/65 px-4 py-3 text-white shadow-xl backdrop-blur-lg sm:flex">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300 text-[#17231e]"><Sparkles aria-hidden="true" className="h-5 w-5" /></span>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Em destaque</p>
                                <p className="text-sm font-semibold">{heroImage.category_label}</p>
                            </div>
                        </div>
                    )}
                </section>

                <section id="inspiracao" className="scroll-mt-28 pt-16 md:pt-20">
                    <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Escolha o seu próximo favorito</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1d2923] md:text-4xl">Inspiração para descobrir</h2>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-gray-500">Uma seleção visual das categorias que tornam o Mercado Aurora especial.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {showcaseCategories.map((category, index) => {
                            const image = showcaseImages.find(item => item.category === category.id);

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => {
                                        const matchingTerm = category.search.find(term => products.some(product =>
                                            `${product.name} ${product.description || ''}`.toLowerCase().includes(term)
                                        ));
                                        setSearchTerm(matchingTerm || '');
                                        document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className={`market-category-card group relative isolate min-h-64 overflow-hidden rounded-3xl bg-[#26332c] text-left text-white shadow-lg shadow-black/10 ${index === 1 ? 'md:translate-y-5' : ''}`}
                                >
                                    {image && (
                                        <img
                                            src={image.url}
                                            alt=""
                                            loading="lazy"
                                            className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101813]/90 via-[#101813]/20 to-transparent" />
                                    <div className="absolute inset-x-0 bottom-0 p-6">
                                        <span className="mb-2 inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
                                            {category.label}
                                        </span>
                                        <h3 className="text-2xl font-extrabold">{category.label}</h3>
                                        <p className="mt-1 text-sm text-white/80">{category.description}</p>
                                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-200">
                                            Descobrir <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section id="sobre" className="mt-20 grid gap-4 rounded-[2rem] bg-[#f1f5ef] p-6 md:grid-cols-3 md:p-8">
                    <div className="flex items-start gap-4 rounded-2xl bg-white/80 p-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><ShoppingBag aria-hidden="true" className="h-5 w-5" /></span>
                        <div><h3 className="font-bold text-[#1d2923]">Escolha com liberdade</h3><p className="mt-1 text-sm leading-5 text-gray-600">Explore o catálogo sem precisar criar uma conta.</p></div>
                    </div>
                    <div className="flex items-start gap-4 rounded-2xl bg-white/80 p-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"><Handshake aria-hidden="true" className="h-5 w-5" /></span>
                        <div><h3 className="font-bold text-[#1d2923]">Direto com vendedores</h3><p className="mt-1 text-sm leading-5 text-gray-600">Faça a sua encomenda e o vendedor entrará em contacto.</p></div>
                    </div>
                    <div className="flex items-start gap-4 rounded-2xl bg-white/80 p-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800"><Banknote aria-hidden="true" className="h-5 w-5" /></span>
                        <div><h3 className="font-bold text-[#1d2923]">Pague ao receber</h3><p className="mt-1 text-sm leading-5 text-gray-600">Pagamento na entrega, de acordo com as opções disponíveis.</p></div>
                    </div>
                </section>
            </div>

            {/* Barra de Busca e Filtros */}
            <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-16 pt-2 lg:px-8">
            <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">O seu próximo favorito está aqui</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1d2923] md:text-4xl">
                        Explore o mercado
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {filteredProducts.length} produto(s) encontrado(s)
                    </p>
                </div>
                
                <div className="relative w-full md:w-[26rem]">
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-full border border-gray-200 bg-white px-5 py-3.5 pl-12 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search aria-hidden="true" className="h-4 w-4" />
                    </span>
                </div>
            </div>

            {loading ? (
                <div role="status" className="flex min-h-56 items-center justify-center rounded-3xl border border-emerald-100 bg-white text-gray-600 shadow-sm">
                    <span className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
                    Carregando produtos...
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package aria-hidden="true" className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'Tente uma busca diferente' : 'Volte mais tarde para ver novidades'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10"
                        >
                            {/* Imagem do produto */}
                            <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <Package aria-hidden="true" className="h-16 w-16 text-emerald-700/30 transition-transform duration-500 group-hover:scale-110" />
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
                                        product.stock > 10 
                                            ? 'bg-green-500/90 text-white' 
                                            : product.stock > 0 
                                            ? 'bg-yellow-500/90 text-white'
                                            : 'bg-red-500/90 text-white'
                                    }`}>
                                        {product.stock > 0 ? `${product.stock} un.` : 'Esgotado'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Conteúdo */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                                    {product.name}
                                </h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                                    {product.description || 'Sem descrição'}
                                </p>
                                
                                <div className="border-t border-gray-100 pt-4 mt-auto">
                                    <p className="mb-1 text-2xl font-extrabold text-emerald-800">
                                        {formatKwanza(product.price)}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Store aria-hidden="true" className="h-3.5 w-3.5" />
                                        <span>{product.user?.name || 'Vendedor'}</span>
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => handleBuy(product)}
                                    disabled={product.stock === 0}
                                    className="mt-4 w-full rounded-xl bg-[#1f4937] px-4 py-3 font-bold text-white shadow-md shadow-emerald-950/10 transition-all duration-300 hover:bg-[#173a2b] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                                >
                                    {product.stock === 0 ? 'Indisponível' : <span className="inline-flex items-center justify-center gap-2"><ShoppingBag aria-hidden="true" className="h-4 w-4" /> Comprar</span>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </section>

            {/* Modal de Checkout */}
            {showCheckout && selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Finalizar Compra
                                </h2>
                                <p className="text-sm text-gray-500">Preencha os seus dados</p>
                            </div>
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <X aria-hidden="true" className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                            <p className="font-semibold text-gray-800 mb-1">{selectedProduct.name}</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {formatKwanza(selectedProduct.price)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Estoque: {selectedProduct.stock} unidades
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                <AlertTriangle aria-hidden="true" className="mr-2 inline h-4 w-4" /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmitOrder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    name="buyer_name"
                                    value={orderData.buyer_name}
                                    onChange={handleOrderChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                    placeholder="Seu nome completo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Telefone *
                                </label>
                                <input
                                    type="tel"
                                    name="buyer_phone"
                                    value={orderData.buyer_phone}
                                    onChange={handleOrderChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                    placeholder="+244 9XX XXX XXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email (opcional)
                                </label>
                                <input
                                    type="email"
                                    name="buyer_email"
                                    value={orderData.buyer_email}
                                    onChange={handleOrderChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Endereço de Entrega *
                                </label>
                                <textarea
                                    name="buyer_address"
                                    value={orderData.buyer_address}
                                    onChange={handleOrderChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                    placeholder="Rua, número, bairro, município, província"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantidade
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={orderData.quantity}
                                    onChange={handleOrderChange}
                                    min="1"
                                    max={selectedProduct.stock}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Observações (opcional)
                                </label>
                                <textarea
                                    name="buyer_notes"
                                    value={orderData.buyer_notes}
                                    onChange={handleOrderChange}
                                    rows={2}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                                    placeholder="Referências para entrega, horário preferido, etc."
                                />
                            </div>

                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs text-amber-800 flex items-center gap-2">
                                    <Banknote aria-hidden="true" className="h-4 w-4 shrink-0" />
                                    <span><strong>Pagamento na entrega</strong> - Pague em dinheiro ou Multicaixa ao receber</span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        A processar...
                                    </span>
                                ) : (
                                    ' Confirmar Compra'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProducts;