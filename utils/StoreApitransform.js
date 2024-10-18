class StoreApiTransform {
    static transform(store){
        return {
            id:store.id,
            title:store.title,
            description:store.content,
            image:store.image,
            price:store.price,
            category:store.category,
            sold:store?.sold,
            created_at:store.created_at,
            dateOfSale:store?.dateofSale,
            author:{
                id:store?.user.id,
                name:store?.user.name,
                image:store?.user?.image !==null ? store?.user?.image:"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngwing.com%2Fen%2Fsearch%3Fq%3Duser%2BAvatar&psig=AOvVaw1aucRJQXBmXUWizbDOn60k&ust=1728406118600000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLipsdnc_IgDFQAAAAAdAAAAABAE"
            }
        }
    }
}

export default StoreApiTransform;