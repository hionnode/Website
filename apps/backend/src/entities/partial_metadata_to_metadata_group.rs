//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.2

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "partial_metadata_to_metadata_group")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub partial_metadata_id: i32,
    #[sea_orm(primary_key, auto_increment = false)]
    pub metadata_group_id: i32,
    pub part: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::metadata_group::Entity",
        from = "Column::MetadataGroupId",
        to = "super::metadata_group::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    MetadataGroup,
    #[sea_orm(
        belongs_to = "super::partial_metadata::Entity",
        from = "Column::PartialMetadataId",
        to = "super::partial_metadata::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    PartialMetadata,
}

impl Related<super::metadata_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MetadataGroup.def()
    }
}

impl Related<super::partial_metadata::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PartialMetadata.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
