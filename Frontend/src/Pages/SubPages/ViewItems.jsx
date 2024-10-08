import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance from '../../Components/Axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ViewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('itemName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItemsId, setSelectedItemsId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosInstance.get('/api/electronics/');
        setItems(response.data);
        setLoading(false);
        const [categoriesResponse, subCategoriesResponse] = await Promise.all([
          axiosInstance.get('/api/categories/'),
          axiosInstance.get('/api/subcategories/')
        ]);
        setCategories(categoriesResponse.data);
        setSubCategories(subCategoriesResponse.data);
        console.log('Fetched categories:', categoriesResponse.data); 
        console.log('Fetched subcategories:', subCategoriesResponse.data);

      } catch (err) {
        setError('Failed to fetch items.');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const openModal = (itemId) => {
    setSelectedItemsId(itemId);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedItemsId(null);
    setModalIsOpen(false);
  };

  const handleDelete = async () => {
    if (selectedItemsId) {
      try {
        const response = await axiosInstance.delete(`/api/electronics/${selectedItemsId}/`);
        console.log('Deleted successfully:', response.data);
        setItems(items.filter(item => item.id !== selectedItemsId));
        closeModal();
      } catch (error) {
        console.error('Deletion failed:', error.response?.data || error.message);
      }
    }
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); 
  };

  const handleSort = (field) => {
    const order = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(order);
  };

  const filteredItems = items
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });





  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="h-full w-full flex flex-col gap-6 bg-gray-100 p-4 md:p-8">
      <div className='bg-white flex flex-col md:flex-row md:justify-between items-center p-3 md:mt-16 mt-16'>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-lg w-full md:w-1/3 mb-4 md:mb-0"
        />
        <div className='flex flex-row gap-4'>
          <Link to={"/manage-items/add-item"}>
            <button className="btn-primary px-4 py-2 rounded-lg text-white md:ml-4">
              Add New Item
            </button>
          </Link>
          <button className="btn-secondary border border-purple-500 px-4 py-2 rounded-lg text-black md:ml-4">
            Export to Excel
          </button>
        </div>
      </div>
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold">ID</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold">Name</th>
                
                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold">Size</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold">Main Category</th>
                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold">Sub Category</th>
                
                
                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold">Quantity</th>
                
                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold">Buying Price</th>
                
                
                <th className="py-3 px-4 border-b border-gray-200 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
            {currentItems.map(item => {
              const mainCategory = categories.find(cat => cat.id === item.main_category)?.name || 'Unknown';
              const subCategory = subCategories.find(sub => sub.id === item.sub_category)?.name || 'Unknown';

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">{item.id}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">{item.name}</td>
                  
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">{item.size}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">{mainCategory}</td>
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">{subCategory}</td>
                  
                  
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">{item.quantity}</td>
                  
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">{item.buying_price}</td>
                  
                  
                  <td className="py-3 px-4 border-b border-gray-200 text-sm">
                    <div className="flex space-x-2">
                      <Link to={`/item-management/edit/${item.id}`}>
                        <button className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600">
                          <FaEdit />
                        </button>
                      </Link>
                      <button 
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600" 
                        onClick={() => openModal(item.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 mx-1 rounded ${
                  currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
         </div>

        </div>
        
        
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Delete"
        className="fixed inset-0 flex flex-col h-24  items-center justify-center p-4 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        style={{
          content: {
            
            maxHeight: '300px', 
            height: 'auto', 
            overflowY: 'auto',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
            margin: 'auto',
            background: 'white',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
        <p className="mb-4">Are you sure you want to delete this cashier?</p>
        <div className="flex justify-end space-x-2">
          <button 
            onClick={closeModal} 
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete} 
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ViewItems;
